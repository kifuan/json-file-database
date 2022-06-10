import test from 'ava'
import { connectDatabase, Obj, sleep } from './shared'
import { connect, createObjectFile } from '../src'

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

    t.true(objs.has(123))

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

test('example', t => {
    t.log('Testing the example code in README.MD')

    type User = { id: number, name: string }

    const usersArr = [
        { id: 1, name: 'San Zhang' },
        { id: 2, name: 'Si Li' },
        { id: 3, name: 'Wu Wang' },
    ]

    const db = connect({
        file: createObjectFile({ users: usersArr })
    })

    const users = db<User>('users')

    t.deepEqual(users.find(1), { id: 1, name: 'San Zhang' })

    t.deepEqual(users.findAll(u => u.id <= 2), usersArr.filter(u => u.id <= 2))

    t.false(users.has(5))

    t.false(users.insert({ id: 2, name: 'Liu Zhao' }))

    t.deepEqual(Array.from(users), usersArr)

    t.true(users.remove(1))

    t.deepEqual(users.removeAll(u => u.id <= 2), 1)

    t.true(users.update(3, { name: 'Liu Zhao' }))
})
