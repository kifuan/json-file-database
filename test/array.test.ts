import test from 'ava'
import { connectDatabase, getObjs, OBJS_ARRAY } from './shared'

test('array-update', t => {
    const db = connectDatabase(t)
    
    const objs = getObjs(db)

    objs.update({ id: 123, name: 'Liu Zhao' })
    t.deepEqual(objs.find({ id: 123 }), { id: 123, name: 'Liu Zhao' })
})

test('array-list', t => {
    const db = connectDatabase(t)
    const objs = getObjs(db)
    t.deepEqual(objs.list(), OBJS_ARRAY)
})

test('array-find-and-has', t => {
    const db = connectDatabase(t)
    const objs = getObjs(db)

    t.true(objs.has({ id: 123 }))
    t.true(objs.has(u => u.id === 123 && u.name === 'San Zhang'))
    t.true(objs.has(u => u.id === 456 && u.name === 'Si Li'))
    t.true(objs.has(u => u.id === 789 && u.name === 'Wu Wang'))
    t.false(objs.has(u => u.id === 114514))
})

test('array-insert', t => {
    const db = connectDatabase(t)
    const objs = getObjs(db)
    
    t.true(objs.insert({ id: 114514, name: 'Koji Tadokoro' }))
    t.false(objs.insert({ id: 114514, name: 'Koji Tadokoro' }))
})

test.todo('array-remove')
