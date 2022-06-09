import { Collection, CollectionOptions } from './collection'
import { readFileSync, writeFileSync } from 'fs'
import { ArrayCollection } from './array-collection'
import { AVLCollection } from './avl-collection'

/**
 * Required collection options for user.
 */
export type RequiredCollectionOptions<T extends object, P extends keyof T> =
    Pick<CollectionOptions<T, P>, 'name' | 'comparator'> & {
        /**
         * The type of collection.
         * @default 'array'
         */
        type?: 'array' | 'avl'
    }

/**
 * The database type that will be provided by function `connect`.
 */
export type Database = <T extends object, P extends keyof T>
    (options: RequiredCollectionOptions<T, P>) => Collection<T, P>

/**
 * What the Database will operate. It must contain array-typed values.
 */
export type JSONData = {
    [key: string] : readonly any[]
}

/**
 * The options when creating a connection of database file.
 */
export type DatabaseOptions = {
    /**
     * The path of database file.
     */
    path: string

    /**
     * The delay of each saving action.
     * 
     * It will be 0 by default.
     */
    delay?: number

    /**
     * If the database file does not exist,
     * it will create a new file with this object in it.
     * 
     * It will be an empty object by default.
     */
    init?: JSONData

    /**
     * After the database file is saved,
     * this function will be called if it is not undefined.
     */
    onSaved?: (this: undefined) => void
}

/**
 * Connects the database synchronously.
 * @param options the options for connection
 * @returns the database
 */
export function connect(options: DatabaseOptions) : Database {
    const { path, delay, onSaved, init } = options
    const data = readDatabaseFile(path, init)

    // Save the data with the technology of "debouncing".
    let timeout: NodeJS.Timeout | undefined
    function save(name: string, elements: () => readonly any[]) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            timeout = undefined
            data[name] = elements()
            writeFileSync(path, JSON.stringify(data))
            onSaved?.apply(undefined)
        }, delay || 0)
    }

    return <T extends object, P extends keyof T>(options: RequiredCollectionOptions<T, P>) => {
        let { name, comparator, type } = options
        type ||= 'array'

        // Make sure the property is an array.
        const elements: readonly T[] = data[name] ||= []
        if (!Array.isArray(elements)) {
            throw new TypeError(`Property ${name} in the database is not an array.`)
        }

        const collOptions = { name, comparator, elements, save }
        
        if (type === 'array') {
            return new ArrayCollection<T, P>(collOptions)
        } else if (type === 'avl') {
            return new AVLCollection<T, P>(collOptions)
        } else {
            throw new TypeError(`Unknown collection type ${type}.`)
        }
    }
}

function readDatabaseFile(path: string, init?: JSONData) : JSONData {
    try {
        return JSON.parse(readFileSync(path, 'utf-8'))
    } catch (err) {
        if (!init) {
            throw err
        }
        return init
    }
}
