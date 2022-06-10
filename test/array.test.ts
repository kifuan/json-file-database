import anyTest, { TestFn } from 'ava'
import { Collection } from '../src'
import { findAndHas, id, insert, list, remove, sort, update } from './collection'
import { connectDatabase, Obj } from './shared'

const test = anyTest as TestFn<{
    objs: Collection<Obj, number>
}>

test.beforeEach(t => {
    const db = connectDatabase()
    t.context.objs = db<Obj>({
        name: 'objs',
        type: 'avl'
    })
})

test('insert', insert)
test('list', list)
test('update', update)
test('find-and-has', findAndHas)
test('remove', remove)
test('sort', t => sort(t, 'array'))
test('id', t => id(t, 'array'))
