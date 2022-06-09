import test from 'ava'

import { ExecutionContext } from 'ava'
import { connect, createObjectFile, Database, DatabaseOptions, RequiredCollectionOptions } from '../src'

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

export function connectDatabase(t: ExecutionContext<any>, options?: Partial<DatabaseOptions>) {
    options ||= {}
    return connect({
        file: createObjectFile({ objs: OBJS_ARRAY }),
        ...options
    })
}

export function getObjs(db: Database, options?: Partial<RequiredCollectionOptions<Obj, 'id'>>) {
    options ||= {}
    return db<Obj, 'id'>({
        name: 'objs',
        comparator: (o1, o2) => o1.id - o2.id,
        ...options
    })
}

test('shared', t => {
    t.log('This is just the file to share functions.')
    t.true(true)
})