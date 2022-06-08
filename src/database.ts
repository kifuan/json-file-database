import { Collection } from './collection'
import { readFile, writeFile } from 'fs/promises'

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
     * It will be an empty function by default.
     */
    onSaved?: () => void
}

/**
 * Connects the database.
 * @param options the options for connection
 * @return the database
 */
export async function connect(options: DatabaseOptions) : Promise<Database> {
    let { path, delay, init, onSaved } = options

    const data = await readDatabaseFile(path, init)

    return <T>(name: string) => {
        return new Collection<T>({
            delay: delay || 0,
            name,
            data,
            async save() {
                await writeFile(path, JSON.stringify(data))
                onSaved && onSaved()
            }
        })
    }
}

async function readDatabaseFile(path: string, init: any) : Promise<any> {
    try {
        return JSON.parse(await readFile(path, 'utf-8'))
    } catch (err) {
        return init
    }
}
