import test from 'ava'
import { connectDatabase, getObjs, sleep } from './shared'

test('db-init', t => {
    const db = connectDatabase(t, {
        init: {
            objs: [ { id: 114514, name: 'Koji Tadokoro' } ]
        }
    })

    const objs = getObjs(db)

    t.true(objs.has(o => o.id === 123))
    t.false(objs.has(o => o.id === 114514))
})

test('db-no-save', async t => {
    let notSaved = true
    const db = connectDatabase(t, {
        onSaved() {
            notSaved = false
        }
    })

    const objs = getObjs(db)

    t.true(objs.has({ id: 123 }))

    t.log('Sleep 50ms to make sure the database is not saved.')
    await sleep(50)

    t.true(notSaved)
})

test('db-save', async t => {
    let saved = false
    const db = connectDatabase(t, {
        onSaved() {
            saved = true
        }
    })

    const objs = getObjs(db)

    objs.insert({ id: 114514, name: 'Koji Tadokoro' })

    t.log('Sleep 50ms to make sure the database is saved.')
    await sleep(50)

    t.true(saved)
})