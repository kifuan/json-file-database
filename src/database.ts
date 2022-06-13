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
     * It will compare elements using built-in operators by default.
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

function withDefaults<T>(data: T, defaults: Partial<T>) : Required<T> {
    return Object.keys(defaults).reduce((data, key) => {
        const data1 = data as any
        const defaults1 = defaults as any
        data1[key] ??= defaults1[key]
        return data
    }, data) as Required<T>
}

function createDatabase(data: JSONData, save: Save) : Database {
    return (options: any) => {
        if (typeof options === 'string') {
            const name = options
            options = { name }
        }

        // Make options with default values.
        const { name, comparator, type } = withDefaults(options, {
            comparator: (first: any, second: any) => {
                if (first > second) {
                    return 1
                } else if (first < second) {
                    return -1
                }
                return 0
            },
            type: 'array',
        })

        // Make sure the property is an array.
        const elements: readonly any[] = data[name] ||= []
        if (!Array.isArray(elements)) {
            throw new TypeError(`Property ${name} in the database is not an array.`)
        }

        // Make collection options.
        const collOptions = { name, comparator, elements, save }
        
        // And use the "strategy" design pattern to create the collection object.
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
    // Make the options with default values.
    let { file, delay, onSaved, init } = withDefaults(options, {
        delay: 0,
        init: {},
        onSaved: () => {},
    })

    if (typeof file === 'string') {
        file = createFile(file)
    }

    // Read the file, or set the data as init.
    let data: JSONData
    try {
        data = JSON.parse(file.read())
    } catch (e) {
        data = init
    }
    const save = getDataSaver(data, delay, file, onSaved)

    return createDatabase(data, save)
}
