# JSON File Database

It's not necessary to use a real database in some small projects, and I often use JSON files as databases. However, just using `JSON` and `fs` is very inconvenient, so this project is made.

## Documentations

Click [here](https://kifuan.github.io/json-file-database/modules.html).

## Features

+ It uses "debouncd" function to save the data. This makes less IO operations.

+ It uses binary-search(for collection typed `array`) or AVL-tree(for collection typed `avl`) to maintain the data. This means their time complexity would be `O(log n)`.

## Usage

First, download it by `npm`(or `yarn`, `pnpm`, etc.).

```bash
npm i json-file-database
```

And then use it in your project like this:

```typescript
import { connect } from 'json-file-database'

type User = { id: number, name: string }

// Connect the database. If there is not the file yet,
// it will create one after running this program.
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

// Specify the type of elements is User,
// and the prime key is id.
const users = db<User>('users')

// Find the user with prime key id.
console.log('The user whose id is 1:', users.find({ id: 1 }))


// Find all users with given condition.
console.log('All users whose id <= 2 are:', users.findAll(u => u.id <= 2))


// Check whether the collection has it.
console.log('Whether the collection has a user whose id is 5:', users.has({ id: 5 }))


// Insert the user and return if it is succeeded.
console.log('Insert a user whose id is 2:', users.insert({ id: 2, name: 'Liu Zhao' }))


// List all users.
// You can also use [...users], as it implemented Iterable.
console.log('All users are:', Array.from(users))


// Remove the user whose id is 1, and check whether it has removed the user.
console.log('Remove the user whose id is 1:', users.remove({ id: 1 }))


// Remove all users that match the condition, and return the number of them.
console.log('Remove all users whose id < 3, the number of them is:',
        users.removeAll(u => u.id < 3)) 


// Update the user with prime key, and return whether it has updated the user.
console.log('Update the user whose id is 3:', users.update({ id: 3, name: 'Liu Zhao' }))
```

At the first time you run, it will create a new file `db.json` and all outputs are expected. However, when you try to run it again, the outputs are not the same.

This is because if there is no file, it will use the `init` property when you try to connect the database; otherwise it will read it directly.
