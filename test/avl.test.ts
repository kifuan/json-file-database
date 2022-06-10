import test from 'ava'
import { connect, createObjectFile } from '../src'
import { connectDatabase, Obj, OBJS_ARRAY } from './shared'

test('insert', t => {
    const db = connectDatabase()
    const objs = db<Obj>({
        name: 'objs',
        type: 'avl'
    })

    t.false(objs.insert({ id: 123, name: 'Liu Zhao' }))

    t.true(objs.insert({ id: 114514, name: 'Koji Tadokoro' }))

    t.false(objs.insert({ id: 114514, name: 'Koji Tadokoro' }))
})

test('list', t => {
    const db = connectDatabase()
    const objs = db<Obj>({
        name: 'objs',
        type: 'avl',
    })
    
    t.deepEqual(Array.from(objs), OBJS_ARRAY)
})

test('update', t => {
    const db = connectDatabase()
    const objs = db<Obj>({
        name: 'objs',
        type: 'avl'
    })

    t.true(objs.update(123, { name: 'Koji Tadokoro' }))
    t.deepEqual(objs.find(123), { id: 123, name: 'Koji Tadokoro' })
})

test('find-and-has', t => {
    const db = connectDatabase()
    const objs = db<Obj>({
        name: 'objs',
        type: 'avl'
    })

    t.deepEqual(objs.find(123), { id: 123, name: 'San Zhang' })
    t.true(objs.has(456))
    t.true(objs.has(o => o.name === 'Wu Wang'))
    t.false(objs.has(114514))
})

test('remove', t => {
    const db = connectDatabase()
    const objs = db<Obj>({
        name: 'objs',
        type: 'avl'
    })

    t.true(objs.remove(123))
    t.false(objs.remove(123))
    t.true(objs.remove(456))
    t.deepEqual([...objs].length, 1)
})

test('sort', t => {
    const numsArr = [63, 3, 57, 7, 62, 9]
    const insertArr = [77, 23, 6, 56]

    const db = connect({
        file: createObjectFile({
            nums: numsArr.map(item => ({ id: item }))
        })
    })
    const nums = db<{ id: number }>({
        name: 'nums',
        type: 'avl',
        comparator: (first, second) => second - first
    })

    insertArr.forEach(i => nums.insert({ id: i }))

    const expected = numsArr.concat(insertArr).sort((a, b) => b - a)
    const actual = Array.from(nums).map(n => n.id)
    t.deepEqual(actual, expected)
})