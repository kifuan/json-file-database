import test, { ExecutionContext } from 'ava'
import { Collection, connect, createObjectFile } from '../src'

type User = { id: number }

function testPerformance(t: ExecutionContext, users: Collection<User, number>, type: string) {
    const insertStart = Date.now()
    for (let i = 0; i < 100000; i++) {
        users.insert({ id: i })
    }
    const insertTime = Date.now() - insertStart
    t.log(`Used ${insertTime}ms to insert 100k items for ${type}.`)
    
    const findStart = Date.now()
    for (let i = 0; i < 100000; i++) {
        t.true(users.has(i))
    }
    const findTime = Date.now() - findStart
    t.log(`Used ${findTime}ms to find 100k items for ${type}.`)

    const removeStart = Date.now()
    for (let i = 45000; i < 55001; i++) {
        t.true(users.remove(i))
    }
    const removeTime = Date.now() - removeStart
    t.log(`Used ${removeTime}ms to remove 10k items for ${type}.`)
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

test.serial('array', t => testPerformance(t, arrayUsers, 'array'))

test.serial('avl', t => testPerformance(t, avlUsers, 'avl'))