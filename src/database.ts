import { Collection } from './collection'
import { readFile, writeFile } from 'fs/promises'
import { readFileSync } from 'fs'

/**
 * The database type. It can be called when collection name,
 * and return the collection for you to operate.
 */
export type Database = <T>(name: string) => Collection<T>

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
    init?: any

    /**
     * After the database file is saved,
     * this function will be called.
     * 
     * It will do nothing after saving if it is undefined.
     */
    onSaved?: () => void
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

function createDatabase(data: any, options: DatabaseOptions) : Database {
    const { path, delay, onSaved } = options

    let timeout: NodeJS.Timeout | undefined

    function save() {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            timeout = undefined
            writeFile(path, JSON.stringify(data)).then(() => onSaved && onSaved())
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

async function readDatabaseFile(path: string, init?: any) : Promise<any> {
    try {
        return JSON.parse(await readFile(path, 'utf-8'))
    } catch (err) {
        if (!init) {
            throw err
        }
        return init
    }
}

function readDatabaseFileSync(path: string, init?: any) : any {
    try {
        return JSON.parse(readFileSync(path, 'utf-8'))
    } catch (err) {
        if (!init) {
            throw err
        }
        return init
    }
}
