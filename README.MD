# JSON File Database

It's not necessary to use a real database in some small projects, and I often use JSON files as database. However, just using `JSON` and `fs` is very inconvenient, so this project is made.

## Feature

It uses "debouncd" function to save the data. This makes less IO operations.


## Todo

Add property `comparator` for `DatabaseOptions`. If it is set, the collection will be AVL-tree based so that it can be more efficient.

If it is not set, it is still working with array-based collection.

## Usage

First, download it by `npm`(or `yarn`, `pnpm`, etc.).

```bash
npm i json-file-database
```

And then use it in your project like this:

```typescript
import { connectSync } from 'json-file-database'

const db = connectSync({  // or use await connect({ ... })
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

## APIs

Here are the documentations.

## Global functions

+ `connect`
    Connects the database.

    ```typescript
    export function connect(options: DatabaseOptions): Promise<Database>
    ```

+ `connectSync`
    Connects the database synchronously.

    ```typescript
    export function connectSync(options: DatabaseOptions): Database
    ```

## Types

+ `Database`
    The database type that will be provided by `connect` or `connectSync `function.

    It is a function that should be called with collection name and type, and return the collection for you to operate.

    ```typescript
    export type Database = <T>(name: string) => Collection<T>
    ```

+ `JSONData`

    What the `Database` will operate. It must contain array-typed values.

    ```typescript
    export type JSONData = {
        [key: string] : any[]
    }
    ```

+ `DatabaseOptions`

    The options when creating a connection of database file.

    | Property  | Type                        | Default      | Description                                                  |
    | --------- | --------------------------- | ------------ | ------------------------------------------------------------ |
    | `path`    | `string`                    | **Required** | The path of database file.                                   |
    | `delay`   | `number`                    | `0`          | The delay of each saving action.                             |
    | `init`    | `JSONData`                  | `{}`         | If the database file does not exist, it will create a new file with this object in it. |
    | `onSaved` | `(this: undefined) => void` | `undefined`  | After the database file is saved, this function will be called if it is not undefined. |

    ```typescript
    export type DatabaseOptions = {
        path: string
        delay?: number
        init?: JSONData
        onSaved?: (this: undefined) => void
    }
    ```

    

+ `Condition<T>`

  The condition used to compare values.

  ```typescript
  export type Condition<T> = (obj: T) => boolean
  ```

  Luckily, you can pass a value and it will be converted to `n => n === value` as `Condition<T>` in all functions that use `Condition<T>`.

+ `Collection<T>`

  A collection is like an array. You can insert, update, delete and find members in it.

  If you called methods that affect the collection, it will start a so-called "debounced" function to save the data.

  **You should not create the collection by yourself. It is created by Database object.**

  Here are its methods and properties:

  + Method `insert`

    Inserts given elements to the collection.

    ```typescript
    insert(...els: T[]): void
    ```

  + Method `update`

    Updates the element that matches given condition.

    + `el`: the element to be updated
    + `cond`: the condition to match elements
    + `return`: whether the element is updated

    If the data is object, it will use `Object.assign` to assign properties to target object, otherwise replace the old value directly.

    If the condition is not function, it will be converted to `n => n === cond` as I said before.

    ```typescript
    update(el: Partial<T> | T, cond: Condition<T> | T): boolean
    ```

  + Method `delete`

    Deletes the element that matches given condition.

    + `cond`: the condition to match elements
    + `return`: whether the element is deleted

    ```typescript
    delete(cond: Condition<T> | T) : boolean
    ```

  + Method `find`

    Finds the element.

    + `cond`: the condition to match the element
    + `return`: the element that matches given condition, or undefined if there is not

    ```typescript
    find(cond: Condition<T> | T) : T | undefined
    ```

  + Method `findAll`

    Finds all elements that match given condition.

    It's better pass a function to match the elements.

    + `cond`: the condition to match elements
    + `return`: all elements that match given condition

    ```typescript
    findAll(cond: Condition<T> | T) : T[]
    ```

  + Method `has`

    Checks whether there is a element that matches given condition.

    + `cond`: the condition to match the element
    + `return`: whether there is a matched element

    ```typescript
    has(cond: Condition<T> | T) : boolean
    ```

  + Method `list`

    Lists all elements the collection has.

    It will deep copy these elements.

    + `return`: all elements it has

    ```typescript
    list() : T[]
    ```

  + Property `length`

    The length of this collection.

    ```typescript
    get length() : number
    ```

# FAQ

## Why not use others?

I want to practice coding. Besides, there are many outdated code written in ES5, without powerful syntax in ES6.

I'm not saying that mine is better, but I do use some features to make this project more comfortable to use.

## Why do you write APIs there?

I used tools like `typedoc` at first, but it was not suitable for this small project. So I write these docs by myself.

In fact, once you installed it, you can easily use like this:

```typescript
import { connectSync } from 'json-file-database'

const db = connectSync({  // or use await connect({ ... })
    path: './db.json',
    init: {
        nums: []
    }
})

const nums = db<number>('nums')
```

And then type `nums.` to see the auto-suggestions your IDE provides.