import test, { ExecutionContext } from 'ava'
import { Collection, connect, createObjectFile } from '../src'

type User = { id: number, n: number }

function testPerformance(t: ExecutionContext, users: Collection<User, number>, type: string) {
    const insertStart = Date.now()
    for (let i = 0; i < 50000; i++) {
        users.insert({ id: i, n: i + 1 })
    }
    const insertTime = Date.now() - insertStart
    t.log(`Spent ${insertTime}ms to insert 50k items for ${type}.`)
    
    const findStart = Date.now()
    for (const id of [1, 10000, 25000, 30000, 49999]) {
        t.deepEqual(users.find(id), { id, n: id+1 })
    }
    const findTime = (Date.now() - findStart) / 5
    t.log(`Spent ${findTime.toFixed(2)}ms in average to find in 50k items for ${type}.`)
}

const arrayUsers = connect({
    file: createObjectFile({
        users: []
    })
})<User>('users')

const avlUsers = connect({
    file: createObjectFile({
        users: []
    })
})<User>({
    name: 'users',
    type: 'avl'
})

test('array', t => testPerformance(t, arrayUsers, 'array'))

test('avl', t => testPerformance(t, avlUsers, 'avl'))
