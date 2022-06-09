import { Collection, CollectionOptions } from './collection'
import { ArrayCollection } from './array-collection'
import { AVLCollection } from './avl-collection'
import { createFile, DatabaseFile } from './database-file'

/**
 * Required collection options for user.
 * @template T the type of elements.
 * @template P the prime key of the type.
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
 * @template T the type of elements.
 * @template P the prime key of the type.
 * @param options the options to create the collection.
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
    
    const data = readDatabaseFile(file, init)

    // Save the data with the technology of "debouncing".
    let timeout: NodeJS.Timeout | undefined
    function save(name: string, elements: () => readonly any[]) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            timeout = undefined
            data[name] = elements()
            const f = file as unknown as DatabaseFile
            f.write(JSON.stringify(data))
            onSaved!.apply(undefined)
        }, delay)
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
        
        // Create the collection depending on the type.
        if (type === 'array') {
            return new ArrayCollection<T, P>(collOptions)
        } else if (type === 'avl') {
            return new AVLCollection<T, P>(collOptions)
        } else {
            throw new TypeError(`Unknown collection type ${type}.`)
        }
    }
}

function readDatabaseFile(file: DatabaseFile, init?: JSONData) : JSONData {
    try {
        return JSON.parse(file.read())
    } catch (err) {
        if (!init) {
            throw err
        }
        return init
    }
}
