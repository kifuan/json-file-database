import test from 'ava'

import { writeFileSync, unlinkSync } from 'fs'
import { connect, connectSync } from '../src'

const PATH = 'test/test-db.json'

function sleep(delay: number) : Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, delay)
    })
}

test.beforeEach(() => {
    writeFileSync(PATH, JSON.stringify({
        nums: [ 123, 456, 789 ],
        objs: [
            { id: 123, name: 'San Zhang' },
            { id: 456, name: 'Si Li' },
            { id: 789, name: 'Wu Wang' }
        ]
    }))
})

test('init', async t => {
    const db = await connect({
        path: PATH,
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
        path: PATH,
        onSaved() {
            notSaved = false
        }
    })
    t.truthy(db<number>('nums').find(n => n === 123))

    t.log('sleep 50ms to make sure the database is not saved.')
    await sleep(50)

    t.true(notSaved)
})

test('save', async t => {
    let saved = false
    const db = await connect({
        path: PATH,
        onSaved() {
            saved = true
        }
    })

    t.true(db<number>('nums').update(114514, n => n === 123))

    t.log('sleep 50ms to make sure the database is saved.')
    await sleep(50)

    t.true(saved)  
})

test('sync', t => {
    const db = connectSync({
        path: PATH
    })
    t.truthy(db<number>('nums').find(n => n === 123))
})
