import test, { ExecutionContext } from 'ava'

import { writeFileSync } from 'fs'
import { connect, connectSync } from '../src'

function sleep(delay: number) : Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, delay)
    })
}

function getDatabasePath(t: ExecutionContext<any>) {
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
    t.log('prepare the database file')
})

test('init', async t => {
    const db = await connect({
        path: getDatabasePath(t),
        init: {
            nums: [ 114, 514 ]
        }
    })

    const col = db<number>('nums')

    t.falsy(col.find(n => n === 114))
    t.truthy(col.find(n => n === 123))
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
    t.truthy(db<number>('nums').find(n => n === 123))

    t.log('sleep 100ms to make sure the database is not saved.')
    await sleep(100)

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

    t.log('sleep 100ms to make sure the database is saved.')
    await sleep(100)

    t.true(saved)
})

test('update', async t => {
    const db = await connect({
        path: getDatabasePath(t)
    })
    const objs = db<{id: number, name: string}>('objs')

    objs.update({ name: 'Liu Zhao' }, obj => obj.id === 123)

    t.deepEqual(objs.find(obj => obj.id === 123), { id: 123, name: 'Liu Zhao' })
})

test('sync', t => {
    const db = connectSync({
        path: getDatabasePath(t)
    })
    t.truthy(db<number>('nums').find(n => n === 123))
})
