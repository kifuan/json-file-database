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

test.beforeEach(t => {
    writeFileSync(getDatabasePath(t), JSON.stringify({
        nums: [ 123, 456, 789 ],
        objs: [
            { id: 123, name: 'San Zhang' },
            { id: 456, name: 'Si Li' },
            { id: 789, name: 'Wu Wang' }
        ]
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

    const nums = db<number>('nums')

    t.false(nums.has(114))
    t.true(nums.has(123))
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
    t.true(db<number>('nums').has(123))

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

    db<number>('nums').insert(114514)

    t.log('Sleep 50ms to make sure the database is saved.')
    await sleep(50)

    t.true(saved)
})

test('update', async t => {
    const db = await connect({
        path: getDatabasePath(t)
    })
    const objs = db<{id: number, name: string}>('objs')
    const nums = db<number>('nums')

    objs.update({ name: 'Liu Zhao' }, obj => obj.id === 123)
    t.deepEqual(objs.find(obj => obj.id === 123), { id: 123, name: 'Liu Zhao' })

    nums.update(114514, 123)
    t.true(nums.has(114514))
})

test('sync', t => {
    const db = connectSync({
        path: getDatabasePath(t)
    })

    const nums = db<number>('nums')
    t.true(nums.has(123))
    t.true(nums.has(456))
    t.true(nums.has(789))
})

test('list', async t => {
    const db = await connect({
        path: getDatabasePath(t)
    })

    const list = db<number>('nums').list()
    t.deepEqual(list, [ 123, 456, 789 ])
})

test('find-and-has', async t => {
    const db = await connect({
        path: getDatabasePath(t)
    })
    
    const nums = db<number>('nums')
    const objs = db<{ id: number, name: string }>('objs')

    t.deepEqual(nums.findAll(n => n < 700), [ 123, 456 ])
    t.deepEqual(nums.find(n => n < 400), 123)

    t.true(objs.has(u => u.id === 123 && u.name === 'San Zhang'))
    t.true(objs.has(u => u.id === 456 && u.name === 'Si Li'))
    t.true(objs.has(u => u.id === 789 && u.name === 'Wu Wang'))
})

test('insert', async t => {
    const db = await connect({
        path: getDatabasePath(t)
    })

    const nums = db<number>('nums')
    
    t.false(nums.insert(123))
    t.false(nums.insert(100, n => n < 900))

    t.true(nums.insert(114))
    t.true(nums.insert(123, n => n < 10)) 
})