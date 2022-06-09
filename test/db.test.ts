import test from 'ava'
import { connectDatabase, Obj, sleep } from './shared'

test('db-init', t => {
    const db = connectDatabase({
        init: {
            objs: [ { id: 114514, name: 'Koji Tadokoro' } ]
        }
    })

    const objs = db<Obj>('objs')

    t.true(objs.has(o => o.id === 123))
    t.false(objs.has(o => o.id === 114514))
})

test('no-save', async t => {
    let notSaved = true
    const db = connectDatabase({
        onSaved() {
            notSaved = false
        }
    })

    const objs = db<Obj>('objs')

    t.true(objs.has({ id: 123 }))

    t.log('Sleep 50ms to make sure the database is not saved.')
    await sleep(50)

    t.true(notSaved)
})

test('save', async t => {
    let saved = false
    const db = connectDatabase({
        onSaved() {
            saved = true
        }
    })

    const objs = db<Obj>('objs')

    objs.insert({ id: 114514, name: 'Koji Tadokoro' })

    t.log('Sleep 50ms to make sure the database is saved.')
    await sleep(50)

    t.true(saved)
})