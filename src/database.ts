import { Collection } from './collection'
import { readFile, writeFile } from 'fs/promises'
import { readFileSync } from 'fs'

/**
 * The database type that will be provided by connect or connectSync function.
 * 
 * It is a function that should be called with collection name and type,
 * and return the collection for you to operate.
 */
export type Database = <T>(name: string) => Collection<T>

/**
 * What the Database will operate. It must contain array-typed values.
 */
export type JSONData = {
    [key: string] : any[]
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
 * Connects the database.
 * @param options the options for connection
 * @return the database
 */
export async function connect(options: DatabaseOptions) : Promise<Database> {
    const { path, init } = options
    const data = await readDatabaseFile(path, init)
    return createDatabase(data, options)
}

/**
 * Connects the database synchronously.
 * @param options the options for connection
 * @return the database
 */
export function connectSync(options: DatabaseOptions) : Database {
    const { path, init } = options
    const data = readDatabaseFileSync(path, init)
    return createDatabase(data, options)
}

function createDatabase(data: JSONData, options: DatabaseOptions) : Database {
    const { path, delay, onSaved } = options

    // Save the data with the technology of "debouncing".
    let timeout: NodeJS.Timeout | undefined
    function save() {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            timeout = undefined
            writeFile(path, JSON.stringify(data)).then(() => onSaved?.apply(undefined))
        }, delay || 0)
    }

    return <T>(name: string) => {
        // Make sure the property is an array.
        const elements: T[] = data[name] ||= []
        if (!Array.isArray(elements)) {
            throw new TypeError(`Property ${name} in the database is not an array.`)
        }
        return new Collection<T>({ elements, save })
    }
}

async function readDatabaseFile(path: string, init?: JSONData) : Promise<JSONData> {
    try {
        return JSON.parse(await readFile(path, 'utf-8'))
    } catch (err) {
        if (!init) {
            throw err
        }
        return init
    }
}

function readDatabaseFileSync(path: string, init?: JSONData) : JSONData {
    try {
        return JSON.parse(readFileSync(path, 'utf-8'))
    } catch (err) {
        if (!init) {
            throw err
        }
        return init
    }
}
