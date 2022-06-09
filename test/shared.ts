import test from 'ava'

import { ExecutionContext } from 'ava'
import { writeFileSync, readdirSync, unlinkSync } from 'fs'
import path from 'path'
import { connect, Database, DatabaseOptions, RequiredCollectionOptions } from '../src'

export function sleep(delay: number) : Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, delay)
    })
}

function getDatabasePath(t: ExecutionContext<any>) {
    // The title in beforeEach hooks will be "before hook for xxx",
    // so I'm gonna remove the "before hook for " and leave the "xxx".
    const title = t.title.replace(/.+hook\sfor\s/, '')
    return `test/test-${title}.json`
}

export function prepareDatabase(t: ExecutionContext<any>) {
    writeFileSync(getDatabasePath(t), JSON.stringify({
        objs: OBJS_ARRAY
    }))
}

export function cleanDatabase(t: ExecutionContext<any>) {
    readdirSync('test').forEach(name => {
        if (!name.endsWith('json')) {
            return
        }
        unlinkSync(path.join('test', name))
    })
    
    t.log('Deleted all test database files.')
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
        path: getDatabasePath(t),
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