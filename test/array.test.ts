import test from 'ava'
import { connectDatabase, getObjs, OBJS_ARRAY } from './shared'

test('update', t => {
    const db = connectDatabase()
    
    const objs = getObjs(db)

    objs.update({ id: 123, name: 'Liu Zhao' })
    t.deepEqual(objs.find({ id: 123 }), { id: 123, name: 'Liu Zhao' })
})

test('list', t => {
    const db = connectDatabase()
    const objs = getObjs(db)
    t.deepEqual(objs.list(), OBJS_ARRAY)
})

test('find-and-has', t => {
    const db = connectDatabase()
    const objs = getObjs(db)

    t.true(objs.has({ id: 123 }))
    t.true(objs.has(u => u.id === 123 && u.name === 'San Zhang'))
    t.true(objs.has(u => u.id === 456 && u.name === 'Si Li'))
    t.true(objs.has(u => u.id === 789 && u.name === 'Wu Wang'))
    t.false(objs.has(u => u.id === 114514))
})

test('insert', t => {
    const db = connectDatabase()
    const objs = getObjs(db)
    
    t.true(objs.insert({ id: 114514, name: 'Koji Tadokoro' }))
    t.false(objs.insert({ id: 114514, name: 'Koji Tadokoro' }))
})

test('remove', t => {
    const db = connectDatabase()
    const objs = getObjs(db)

    t.true(objs.remove({ id: 123 }))
    t.false(objs.remove({ id: 123 }))
    t.true(objs.remove({ id: 456 }))
    t.deepEqual(objs.length, 1)
})
