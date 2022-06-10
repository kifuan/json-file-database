/**
 * The element will be used in collections.
 * @template K the type of id.
 */
 export interface Element<K> {
    id: K
}

/**
 * The condition to to compare objects.
 */
export type Condition<E extends Element<K>, K> = (obj: E) => boolean

/**
 * The comparator to compare prime keys for objects.
 */
export type Comparator<K> = (first: K, second: K) => number

/**
 * The function to save the collection.
 */
export type Save = (name: string, elements: () => readonly any[]) => void

/**
 * The options when creating a collection.
 * @template T the type of elements.
 * @template P the prime key of the type.
 */
export interface InternalCollectionOptions<E extends Element<K>, K> {
    /**
     * The name of collection.
     */
    name: string

    /** 
     * The comparator to compare the elements.
     */
    comparator: Comparator<K>

    /**
     * The elements for the collection.
     */
    elements: E[]

    /**
     * To save the collection.
     */
    save: Save
}

/**
 * A collection is like an array.
 * You can insert, update, delete and find elements in it.
 * 
 * If you called methods that affect the collection,
 * it will start a so-called "debounced" function to save the data.
 * 
 * Besides, you can also use `Array.from(collection)`, `[...collection]`,
 * or `for (const element of collection)` if you want, as it implemented
 * the Iterable<T>.
 * 
 * @template T the type of element.
 * @template P the prime key for element type.
 */
export interface Collection<E extends Element<K>, K> extends Iterable<E> {
    /**
     * Inserts the element to the collection.
     * @param el the element to be inserted.
     * @returns whether it has inserted the element.
     */
    insert(el: E) : boolean

    /**
     * Updates the element by `Object.assign`.
     * @param el the element to be updated.
     * @returns whether it has updated the element.
     */
    update(key: K, el: Partial<Omit<E, 'id'>>) : boolean

    /**
     * Removes the element.
     * @param el the element to be removed.
     * @returns whether it has removed the element.
     */
    remove(key: K) : boolean

    /**
     * Removes all elements that match the condition.
     * @param cond the condition to match the element to be removed.
     * @returns the number of elements it has removed.
     */
    removeAll(cond: Condition<E, K>) : number

    /**
     * Checks whether the element is in this collection.
     * @param el the element to be checked.
     * @returns whether the element is in this collection.
     */
    has(key: K) : boolean

    /**
     * Checks whether there is an element that matches the condition.
     * @param cond the condition to match the element to be checked.
     * @returns whether there is an element that matches the condition.
     */
    has(cond: Condition<E, K>) : boolean

    /**
     * Finds the element.
     * @param el the element to be found.
     * @returns the found element, or undefined if it hasn't found.
     */
    find(key: K) : Readonly<E> | undefined

    /**
     * Finds all elements that match given condition.
     * @param cond the condition to match the elements.
     * @returns all elements that match given condition.
     */
    findAll(cond: Condition<E, K>) : readonly E[]
}
