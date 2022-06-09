# JSON File Database

It's not necessary to use a real database in some small projects, and I often use JSON files as database. However, just using `JSON` and `fs` is very inconvenient, so this project is made.

## Note

**This project is still developing!!!**
**Incompatible API changes may happen!!!**

## Feature

It uses "debouncd" function to save the data. This makes less IO operations.

## Usage

First, download it by `npm`(or `yarn`, `pnpm`, etc.).

```bash
npm i json-file-database
```

And then use it in your project like this:

```typescript
import { connect } from 'json-file-database'

const db = connect({
    path: './db.json',
    init: { nums: [ 1, 2, 3 ] },
    delay: 1000,
    onSaved() {
        console.log('The database is saved!')
    }
})

const nums = db<number>('nums')

// Insert 6 to the collection.
nums.insert(6)

// Replace 2 with 123.
nums.update(123, 2)

// Delete element 1.
nums.delete(1)

// Find elements that is smaller than 5.
// It will be 3.
console.log(nums.find(n => n < 5))

// Finds all elements that is bigger than 5
// It will be [ 123, 6 ]
console.log(nums.findAll(n => n > 5))

// Check whether 123 is in the collection.
// It is true because we've updated 2 with 123.
console.log(nums.has(123))

// List the collection. It is [ 123, 3, 6 ].
console.log(nums.list())

// Gets the length of this collection. It is 3.
console.log(nums.length)
```

At the first time you run, it will create a new file `db.json` and all outputs are expected. However, when you try to run it again, the outputs are not the same.

This is because if there is no file, it will use the `init` property when you try to connect the database; otherwise it will read it directly.
