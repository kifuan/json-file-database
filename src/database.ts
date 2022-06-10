import { Collection, Comparator, Element, Save } from './collection'
import { createFile, DatabaseFile } from './database-file'
import ArrayCollection from './array-collection'
import AVLCollection from './avl-collection'

/**
 * Options to create a collection.
 * @template I the type of id.
 */
export interface CollectionOptions<I> {
    /**
     * The name of the collection.
     */
    name: string

    /**
     * The comparator to compare the elements.
     * @default (a,b)=>a-b
     */
    comparator?: Comparator<I>

    /**
     * The type of collection.
     * @default 'array'
     */
    type?: 'array' | 'avl'
}

/**
 * What the Database will operate. It must contain array-typed values.
 */
export interface JSONData {
    [key: string] : readonly any[]
}

/**
 * The options when creating a connection of database file.
 */
export interface DatabaseOptions {
    /**
     * The file to process.
     * If it is a string, it will be seen as a path to the file.
     */
    file: string | DatabaseFile

    /**
     * The delay of each saving action.
     * @default 0
     */
    delay?: number

    /**
     * If the database file does not exist,
     * it will create a new file with this object in it.
     * @default {}
     */
    init?: JSONData

    /**
     * After the database file is saved,
     * this function will be called if it is not undefined.
     * @default ()=>{}
     */
    onSaved?: (this: undefined) => void
}

/**
 * The database that will be provided by function `connect`.
 */
export interface Database {
    /**
     * Creates a collection by full information.
     * 
     * @template E the type of elements.
     * @template I the type of id.
     * @param options the options to create the collection.
     * @returns the collection.
     */
    <E extends Element<I>, I = number>(options: CollectionOptions<I>): Collection<E, I>

    /**
     * Creates a collection only by its name.
     * 
     * This means you cannot specify the comparator, so the type
     * of key must be number.
     * 
     * @template E the element whose id is typed number.
     * @param name the name of collection.
     * @returns the collection.
     */
    <E extends Element<number>>(name: string): Collection<E, number>
}

function readDatabaseFile(file: DatabaseFile, init: JSONData) : JSONData {
    try {
        return JSON.parse(file.read())
    } catch (err) {
        return init
    }
}

function getDataSaver(data: JSONData, delay: number, file: DatabaseFile, onSaved: () => void) : Save {
    let timeout: NodeJS.Timeout | undefined
    return (name, elements) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            data[name] = elements()
            file.write(JSON.stringify(data))
            onSaved.apply(undefined)
        }, delay)
    }
}

function createDatabase(data: JSONData, save: Save) : Database {
    return (options: any) => {
        if (typeof options === 'string') {
            const name = options
            options = { name }
        }
        let { name, comparator, type } = options
        comparator ||= (first: any, second: any) => first - second
        type ||= 'array'

        // Make sure the property is an array.
        const elements: readonly any[] = data[name] ||= []
        if (!Array.isArray(elements)) {
            throw new TypeError(`Property ${name} in the database is not an array.`)
        }

        const collOptions = { name, comparator, elements, save }

        const types = {
            array: () => new ArrayCollection<any, any>(collOptions),
            avl: () => new AVLCollection<any, any>(collOptions)
        }
        if (!(type in types)) {
            throw new TypeError(`Unknown collection type ${type}.`)
        }
        return types[type as keyof typeof types]()
    }
}

/**
 * Connects the database synchronously.
 * @param options the options for connection.
 * @returns the database.
 */
export function connect(options: DatabaseOptions) : Database {
    let { file, delay, onSaved, init } = options
    if (typeof file === 'string') {
        file = createFile(file)
    }

    delay ||= 0
    onSaved ||= () => {}
    init ||= {}

    const data = readDatabaseFile(file, init)
    const save = getDataSaver(data, delay, file, onSaved)

    return createDatabase(data, save)
}
