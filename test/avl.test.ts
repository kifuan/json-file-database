import test from 'ava'
import { cleanDatabase, connectDatabase, getObjs, OBJS_ARRAY, prepareDatabase } from './shared'

test.beforeEach(t => {
    prepareDatabase(t)
})

test.afterEach(t => {
    cleanDatabase(t)
})

test('avl-insert', t => {
    const db = connectDatabase(t)
    const objs = getObjs(db, { type: 'avl' })

    t.false(objs.insert({ id: 123, name: 'Liu Zhao' }))

    t.true(objs.insert({ id: 114514, name: 'Koji Tadokoro' }))

    t.false(objs.insert({ id: 114514, name: 'Koji Tadokoro' }))
})

// test('avl-list', t => {
//     const db = connectDatabase(t)
//     const objs = getObjs(db, { type: 'avl' })
    
//     t.deepEqual(objs.list(), OBJS_ARRAY)
// })

// test('avl-update', t => {
//     const db = connectDatabase(t)
//     const objs = getObjs(db, { type: 'avl' })

//     t.true(objs.update({ id: 123, name: 'Koji Tadokoro' }))
//     t.false(objs.update({ id: 123, name: 'Koji Tadokoro' }))
//     t.deepEqual(objs.find({ id: 123 }), { id: 123, name: 'Koji Tadokoro' })
// })

// test('avl-find-and-has', t => {
//     const db = connectDatabase(t)
//     const objs = getObjs(db, { type: 'avl' })

//     t.deepEqual(objs.find({ id: 123 }), { id: 123, name: 'San Zhang' })
//     t.true(objs.has({ id: 456 }))
//     t.true(objs.has(o => o.name === 'Wu Wang'))
//     t.false(objs.has({ id: 114514 }))
// })


// test.todo('avl-remove')