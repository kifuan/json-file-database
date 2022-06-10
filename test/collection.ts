import { ExecutionContext } from 'ava'
import { Collection, connect, createObjectFile } from '../src'
import { Obj, OBJS_ARRAY } from './shared'

type Ctx = {
    objs: Collection<Obj, number>
}

export type Test = ExecutionContext<Ctx>

export function update(t: Test) {
    const objs = t.context.objs
    t.true(objs.update(123, { name: 'Liu Zhao' }))
    t.deepEqual(objs.find(123), { id: 123, name: 'Liu Zhao' })

    t.true(objs.update(123, { name: 'Koji Tadokoro' }))
    t.deepEqual(objs.find(123), { id: 123, name: 'Koji Tadokoro' })
}

export function list(t: Test) {
    const objs = t.context.objs
    t.deepEqual(Array.from(objs), OBJS_ARRAY)
}

export function insert(t: Test) {
    const objs = t.context.objs
    t.false(objs.insert({ id: 123, name: 'Liu Zhao' }))
    t.true(objs.insert({ id: 114514, name: 'Koji Tadokoro' }))
    t.false(objs.insert({ id: 114514, name: 'Koji Tadokoro' }))
}

export function findAndHas(t: Test) {
    const objs = t.context.objs
    t.deepEqual(objs.find(123), { id: 123, name: 'San Zhang' })
    t.true(objs.has(456))
    t.true(objs.has(o => o.name === 'Wu Wang'))
    t.false(objs.has(114514))
}

export function remove(t: Test) {
    const objs = t.context.objs
    t.true(objs.remove(123))
    t.false(objs.remove(123))
    t.true(objs.remove(456))
    t.deepEqual([...objs].length, 1)
}

export function id(t: Test, type: 'array' | 'avl') {
    const wordsArr = [ 'the', 'quick', 'brown', 'fox', 'jumps' ]
    // "over the lazy dog", here we don't use "the" to make elements unique.
    const insertArr = [ 'over', 'lazy', 'dog' ]

    const comparator = (s1: string, s2: string) => {
        for (let i = 0; i < s1.length; i++) {
            const c1 = s1.charCodeAt(i)
            const c2 = s2.charCodeAt(i)

            if (isNaN(c2)) {
                return c1
            } else if (c1 !== c2) {
                return c1 - c2
            }
        }

        return 0
    }

    const db = connect({
        file: createObjectFile({
            words: wordsArr.map(w => ({ id: w }))
        })
    })

    const words = db<{ id: string }, string>({
        name: 'words',
        type, comparator
    })

    insertArr.forEach(i => words.insert({ id: i }))
    const expected = wordsArr.concat(insertArr).sort(comparator)
    const actual = Array.from(words).map(w => w.id)

    t.deepEqual(expected, actual)
}

export function sort(t: Test, type: 'array' | 'avl') {
    const numsArr = [63, 3, 57, 7, 62, 9]
    const insertArr = [77, 23, 6, 56]

    const db = connect({
        file: createObjectFile({
            nums: numsArr.map(item => ({ id: item }))
        })
    })

    const nums = db<{ id: number }>({
        name: 'nums',
        type,
        comparator: (first, second) => second - first
    })

    insertArr.forEach(i => nums.insert({ id: i }))

    const expected = numsArr.concat(insertArr).sort((a, b) => b - a)
    const actual = Array.from(nums).map(n => n.id)
    t.deepEqual(actual, expected)
}