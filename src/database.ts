import { Collection, Comparator, InternalCollectionOptions, Save } from './collection'
import { createFile, DatabaseFile } from './database-file'
import ArrayCollection from './array-collection'
import AVLCollection from './avl-collection'

/**
 * Required collection options for user.
 * @template T the type of elements.
 * @template P the prime key of the type.
 */
export interface CollectionOptions<T extends object, P extends keyof T> {
    /**
     * The name of the collection.
     */
    name: string

    /**
     * The comparator to compare the elements.
     */
    comparator: Comparator<T, P>

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
 * 
 * Note that if the comparator is not provided, it will compare
 * the `id` property as number for each element.
 */
export interface Database {
    /**
     * Creates a collection with full options.
     * @template T the type of element.
     * @template P the prime key of the type.
     * @param options the options to create the collection.
     * @returns the collection.
     */
    <T extends object, P extends keyof T>(options: CollectionOptions<T, P>): Collection<T, P>

    /**
     * Creates a collection with name, whose element's prime key is `id`.
     * @template T the type of element, whose prime key is `id`.
     * @param name the name of the collection.
     * @returns the collection.
     */
    <T extends { id: number }>(name: string): Collection<T, 'id'>

    /**
     * Creates a collection with options, whose element's prime key is `id`.
     * @template T the type of element, whose prime key is `id`.
     * @param options the options to create the collection.
     * @returns the collection.
     */
    <T extends { id: number }>(options: Omit<CollectionOptions<T, 'id'>, 'comparator'>): Collection<T, 'id'>
}

function readDatabaseFile(file: DatabaseFile, init: JSONData) : JSONData {
    try {
        return JSON.parse(file.read())
    } catch (err) {
        return init
    }
}

function getDataSaver(data: JSONData, delay: number, file: DatabaseFile, onSaved: () => void) : Save<any> {
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

function createDatabase(data: JSONData, save: Save<any>) : Database {
    return (options: any) => {
        if (typeof options === 'string') {
            const name = options
            options = { name }
        }
        let { name, comparator, type } = options
        comparator ||= (first: any, second: any) => first.id - second.id
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
