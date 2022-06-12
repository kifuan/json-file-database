# JSON File Database

It's not necessary to use a real database in some small projects, and I often use JSON files as databases. However, just using `JSON` and `fs` is very inconvenient, so this project is made.

## Documentations

Click [here](https://kifuan.github.io/json-file-database/modules.html).

## Features

+ Pure TypeScript. This helps you make fewer mistakes about types.

+ Whenever you change the collection, it will start a timer to save the data. If some changes happen during specified delay, it will **restart** the timer. This is so-called **debouncing**.

+ It uses binary-search(for collections typed `array`) or AVL-tree(for collections typed `avl`) to maintain the data. This means their best time complexity would be `O(log n)`.

## Usage

First, download it by `npm`(or `yarn`, `pnpm`, etc.).

```bash
npm i json-file-database
```

And then use it in your project like this:

```typescript
import { connect } from 'json-file-database'

/**
 * The type of elements must have an `id` property
 * to make them unique and sorted in the collection.
 */
type User = { id: number, name: string }

/**
 * Connect to the database.
 * If there is not specified file yet, it will create one after running this program.
 */
const db = connect({
    file: './db.json',
    init: {
        users: [
            { id: 1, name: 'San Zhang' },
            { id: 2, name: 'Si Li' },
            { id: 3, name: 'Wu Wang' },
        ]
    }
})

/**
 * Specify the type of elements is `User`.
 * 
 * You can go to the documentations to see how to customize all
 * options, including the `comparator` to compare the elements.
 */
const users = db<User>('users')

/**
 * Find the element with its id.
 */
console.log('The user whose id is 1:', users.find(1))


/**
 * Find all elements that match given condition.
 */
console.log('All users whose id <= 2 are:', users.findAll(u => u.id <= 2))


/**
 * Check whether this collection has the element.
 */
console.log('Whether the collection has a user whose id is 5:', users.has(5))


/**
 * Insert an element and return whether it has been inserted.
 */
console.log('Insert a user whose id is 2:', users.insert({ id: 2, name: 'Liu Zhao' }))


/**
 * List all elements.
 * 
 * You can also use `[...users]` or `for...of` because
 * it has implemented Iterable<E>.
 */
console.log('All users are:', Array.from(users))


/**
 * Remove the element and return whether it has been removed.
 */
console.log('Remove the user whose id is 1:', users.remove(1))


/**
 * Remove all elements that match the condition, and return the number of them.
 */
console.log('Remove all users whose id < 3, the number of them is:',
        users.removeAll(u => u.id < 3)) 


/**
 * Update the element with id, and return whether it has been updated.
 */
console.log('Update the user whose id is 3:', users.update(3, { name: 'Liu Zhao' }))
```

At the first time you run, it will create a new file `db.json` and all outputs are expected. However, when you try to run it again, the outputs are not the same.

This is because if there is no file, it will use the `init` property when you try to connect the database; otherwise it will read it directly.

# FAQs

## When and How to Use AVL-based Collection?

You should use it only when you have to insert data very frequently.

Here is an example to use it:

```typescript
const users = db<User>({
    name: 'users',
    type: 'avl'
})
```

Normally, using **array-based** collection is enough, because saving **AVL-based** collection needs to convert it to an array(in JSON), which may be expensive cost when there is large data.

## The Specific Time Complexity?

Like the previous question, inserting or removing data is not friendly to **array-based** collection. However, `find` is usually what happens the most.

| Type             | Array-based | AVL-based    |
| ---------------- | ----------- | ------------ |
| Insert           | `O(n)`      | `O(log n)`   |
| Update           | `O(log n)`  | `O(log n)`   |
| Remove           | `O(n)`      | `O(log n)`   |
| RemoveAll        | `O(n^2)`    | `O(n*log n)` |
| Has (id)         | `O(log n)`  | `O(log n)`   |
| Has (condition)  | `O(n)`      | `O(n)`       |
| Find (id)        | `O(log n)`  | `O(log n)`   |
| Find (condition) | `O(n)`      | `O(n)`       |
| FindAll          | `O(n)`      | `O(n)`       |
| Save             | `O(1)`      | `O(n)`       |

Besides, the space complexity of **AVL-based** collection is `S(n)` to create a new array.