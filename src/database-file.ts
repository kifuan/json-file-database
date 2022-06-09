import { readFileSync, writeFileSync } from 'fs'

/**
 * The file for the database to read.
 */
export interface DatabaseFile {
    read() : string

    write(content: string) : void
}

/**
 * Creates a real file in the disk.
 * @param path the path of file.
 * @returns the file for the database to read.
 */
export function createFile(path: string) : DatabaseFile {
    return {
        read() {
            return readFileSync(path, 'utf-8')
        },

        write(content) {
            writeFileSync(path, content)
        }
    }
}

/**
 * Creates a "file" of an object.
 * @param content the content object.
 * @returns the file for the database to read.
 */
export function createObjectFile(content: object) : DatabaseFile {
    return {
        read() {
            return JSON.stringify(content)
        },
        write() {}
    }
}