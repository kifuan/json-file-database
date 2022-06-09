import test from 'ava'
import { connect, createObjectFile } from '../src'
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
    
    t.deepEqual(Array.from(objs), OBJS_ARRAY)
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
    t.deepEqual([...objs].length, 1)
})

test('sort', t => {
    const numsArr = [63, 3, 57, 7, 62, 9]
    const insertArr = [77, 23, 6, 56]

    const db = connect({
        file: createObjectFile({
            nums: numsArr.map(item => ({ val: item }))
        })
    })
    const nums = db<{ val: number }, 'val'>({
        name: 'nums',
        type: 'avl',
        comparator: (first, second) => first.val - second.val
    })

    insertArr.forEach(i => nums.insert({ val: i }))

    const expected = numsArr.concat(insertArr).sort((a, b) => a - b)
    const actual = Array.from(nums).map(n => n.val)
    t.deepEqual(actual, expected)
})