import test from 'ava'
import { connectDatabase, getObjs, OBJS_ARRAY } from './shared'

test('insert', t => {
    const db = connectDatabase()
    const objs = getObjs(db, { type: 'avl' })

    t.false(objs.insert({ id: 123, name: 'Liu Zhao' }))

    t.true(objs.insert({ id: 114514, name: 'Koji Tadokoro' }))

    t.false(objs.insert({ id: 114514, name: 'Koji Tadokoro' }))
})

test('list', t => {
    const db = connectDatabase()
    const objs = getObjs(db, { type: 'avl' })
    
    t.deepEqual(objs.list(), OBJS_ARRAY)
})

test('update', t => {
    const db = connectDatabase()
    const objs = getObjs(db, { type: 'avl' })

    t.true(objs.update({ id: 123, name: 'Koji Tadokoro' }))
    t.deepEqual(objs.find({ id: 123 }), { id: 123, name: 'Koji Tadokoro' })
})

test('find-and-has', t => {
    const db = connectDatabase()
    const objs = getObjs(db, { type: 'avl' })

    t.deepEqual(objs.find({ id: 123 }), { id: 123, name: 'San Zhang' })
    t.true(objs.has({ id: 456 }))
    t.true(objs.has(o => o.name === 'Wu Wang'))
    t.false(objs.has({ id: 114514 }))
})

test('remove', t => {
    const db = connectDatabase()
    const objs = getObjs(db, { type: 'avl' })

    t.true(objs.remove({ id: 123 }))
    t.false(objs.remove({ id: 123 }))
    t.true(objs.remove({ id: 456 }))
    t.deepEqual(objs.length, 1)
})
