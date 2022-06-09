import test, { ExecutionContext } from 'ava'
import { unlinkSync, readdirSync, writeFileSync } from 'fs'
import path from 'path'

import { connect, connectSync } from '../src'

function sleep(delay: number) : Promise<void> {
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

type Obj = {
    id: number
    name: string
}

const OBJS_ARRAY = [
    { id: 123, name: 'San Zhang' },
    { id: 456, name: 'Si Li' },
    { id: 789, name: 'Wu Wang' }
]

test.beforeEach(t => {
    writeFileSync(getDatabasePath(t), JSON.stringify({
        objs: OBJS_ARRAY
    }))
})

test.after(t => {
    readdirSync('test').forEach(name => {
        if (!name.endsWith('json')) {
            return
        }
        unlinkSync(path.join('test', name))
    })
    
    t.log('Deleted all test database files.')
})

test('init', async t => {
    const db = await connect({
        path: getDatabasePath(t),
        init: {
            nums: [ 114, 514 ]
        }
    })

    const objs = db<Obj>('objs')

    t.true(objs.has(o => o.id === 123))
    t.false(objs.has(o => o.id === 114514))
})

test('no-save', async t => {
    let notSaved = true
    const db = await connect({
        path: getDatabasePath(t),
        onSaved() {
            notSaved = false
            t.fail()
        }
    })
    t.true(db<Obj>('objs').has(o => o.id === 123))

    t.log('Sleep 50ms to make sure the database is not saved.')
    await sleep(50)

    t.true(notSaved)
})

test('save', async t => {
    let saved = false
    const db = await connect({
        path: getDatabasePath(t),
        onSaved() {
            saved = true
        }
    })

    db<Obj>('objs').insert({ id: 114514, name: 'Koji Tadokoro' }, o => o.id === 114514)

    t.log('Sleep 50ms to make sure the database is saved.')
    await sleep(50)

    t.true(saved)
})

test('update', async t => {
    const db = await connect({
        path: getDatabasePath(t)
    })
    const objs = db<Obj>('objs')

    objs.update({ name: 'Liu Zhao' }, obj => obj.id === 123)
    t.deepEqual(objs.find(obj => obj.id === 123), { id: 123, name: 'Liu Zhao' })
})

test('sync', t => {
    const db = connectSync({
        path: getDatabasePath(t)
    })

    const objs = db<Obj>('objs')

    t.true(objs.has(o => o.id === 123))
    t.false(objs.has(o => o.id === 114514))
})

test('list', async t => {
    const db = await connect({
        path: getDatabasePath(t)
    })

    const list = db<Obj>('objs').list()
    t.deepEqual(list, OBJS_ARRAY)
})

test('find-and-has', async t => {
    const db = await connect({
        path: getDatabasePath(t)
    })

    const objs = db<{ id: number, name: string }>('objs')

    t.true(objs.has(u => u.id === 123 && u.name === 'San Zhang'))
    t.true(objs.has(u => u.id === 456 && u.name === 'Si Li'))
    t.true(objs.has(u => u.id === 789 && u.name === 'Wu Wang'))
})

test('insert', async t => {
    const db = await connect({
        path: getDatabasePath(t)
    })

    const objs = db<Obj>('objs')
    
    t.false(objs.insert({ id: 114514, name: 'Koji Tadokoro' }, o => o.id === 123))
    t.true(objs.insert({ id: 114514, name: 'Koji Tadokoro' }, o => o.id === 114514))
})
