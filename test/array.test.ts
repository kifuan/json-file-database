import test from 'ava'
import { connect, createObjectFile } from '../src'
import { connectDatabase, Obj, OBJS_ARRAY } from './shared'

test('update', t => {
    const db = connectDatabase()
    const objs = db<Obj>('objs')

    objs.update(123, { name: 'Liu Zhao' })
    t.deepEqual(objs.find(123), { id: 123, name: 'Liu Zhao' })
})

test('list', t => {
    const db = connectDatabase()
    const objs = db<Obj>('objs')
    t.deepEqual(Array.from(objs), OBJS_ARRAY)
})

test('find-and-has', t => {
    const db = connectDatabase()
    const objs = db<Obj>('objs')

    t.true(objs.has(123))
    t.true(objs.has(u => u.id === 123 && u.name === 'San Zhang'))
    t.true(objs.has(u => u.id === 456 && u.name === 'Si Li'))
    t.true(objs.has(u => u.id === 789 && u.name === 'Wu Wang'))
    t.false(objs.has(u => u.id === 114514))
})

test('insert', t => {
    const db = connectDatabase()
    const objs = db<Obj>('objs')
    
    t.true(objs.insert({ id: 114514, name: 'Koji Tadokoro' }))
    t.false(objs.insert({ id: 114514, name: 'Koji Tadokoro' }))
})

test('remove', t => {
    const db = connectDatabase()
    const objs = db<Obj>('objs')

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
        comparator: (first, second) => second - first
    })

    insertArr.forEach(i => nums.insert({ id: i }))

    const expected = numsArr.concat(insertArr).sort((a, b) => b - a)
    const actual = Array.from(nums).map(n => n.id)
    t.deepEqual(actual, expected)
})