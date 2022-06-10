import { connect, createObjectFile, DatabaseOptions } from '../src'

export function sleep(delay: number) : Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, delay)
    })
}

export type Obj = {
    id: number
    name: string
}

export const OBJS_ARRAY = [
    { id: 123, name: 'San Zhang' },
    { id: 456, name: 'Si Li' },
    { id: 789, name: 'Wu Wang' }
]

export function connectDatabase(options?: Partial<DatabaseOptions>) {
    options ||= {}
    return connect({
        file: createObjectFile({ objs: OBJS_ARRAY }),
        ...options
    })
}
