import test, { ExecutionContext } from 'ava'
import { unlinkSync, readdirSync, writeFileSync } from 'fs'
import path from 'path'

import { connect } from '../src'

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
    const db = connect({
        path: getDatabasePath(t),
        init: {
            nums: [ 114, 514 ]
        }
    })

    const objs = db<Obj, 'id'>({
        name: 'objs',
        comparator: (o1, o2) => o1.id - o2.id
    })

    t.true(objs.has(o => o.id === 123))
    t.false(objs.has(o => o.id === 114514))
})

test('no-save', async t => {
    let notSaved = true
    const db = connect({
        path: getDatabasePath(t),
        onSaved() {
            notSaved = false
            t.fail()
        }
    })

    const objs = db<Obj, 'id'>({
        name: 'objs',
        comparator: (o1, o2) => o1.id - o2.id
    })

    t.true(objs.has({ id: 123 }))

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

    const objs = db<Obj, 'id'>({
        name: 'objs',
        comparator: (o1, o2) => o1.id - o2.id
    })

    objs.insert({ id: 114514, name: 'Koji Tadokoro' })

    t.log('Sleep 50ms to make sure the database is saved.')
    await sleep(50)

    t.true(saved)
})

test('update', t => {
    const db = connect({
        path: getDatabasePath(t)
    })
    
    const objs = db<Obj, 'id'>({
        name: 'objs',
        comparator: (o1, o2) => o1.id - o2.id
    })

    objs.update({ id: 123, name: 'Liu Zhao' })
    t.deepEqual(objs.find({ id: 123 }), { id: 123, name: 'Liu Zhao' })
})

test('list', t => {
    const db = connect({
        path: getDatabasePath(t)
    })

    const objs = db<Obj, 'id'>({
        name: 'objs',
        comparator: (o1, o2) => o1.id - o2.id
    })

    t.deepEqual(objs.list(), OBJS_ARRAY)
})

test('find-and-has', t => {
    const db = connect({
        path: getDatabasePath(t)
    })

    const objs = db<Obj, 'id'>({
        name: 'objs',
        comparator: (o1, o2) => o1.id - o2.id
    })

    t.true(objs.has(u => u.id === 123 && u.name === 'San Zhang'))
    t.true(objs.has(u => u.id === 456 && u.name === 'Si Li'))
    t.true(objs.has(u => u.id === 789 && u.name === 'Wu Wang'))
})

test('insert', t => {
    const db = connect({
        path: getDatabasePath(t)
    })

    const objs = db<Obj, 'id'>({
        name: 'objs',
        comparator: (o1, o2) => o1.id - o2.id
    })
    
    t.true(objs.insert({ id: 114514, name: 'Koji Tadokoro' }))
    t.false(objs.insert({ id: 114514, name: 'Koji Tadokoro' }))
})
