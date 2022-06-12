/**
 * The element will be used in collections.
 * @template I the type of id.
 */
 export interface Element<I> {
    id: I
}

/**
 * The condition to to compare elements.
 * @template E the type of elements.
 * @template I the type of id.
 * @param el the element.
 * @returns whether the element matches the condition.
 */
export type Condition<E extends Element<I>, I> = (el: Readonly<E>) => boolean

/**
 * The comparator to compare the id of elements.
 * @template I the type of id.
 * @param first the first id.
 * @param second the second id.
 * @returns the comparing result.
 */
export type Comparator<I> = (first: I, second: I) => number

/**
 * The function to save the collection.
 * @param name the name of the collection.
 * @param elements the getter of elements to be saved in JSON file.
 */
export type Save = (name: string, elements: () => readonly any[]) => void

/**
 * The options when creating a collection.
 * @template E the type of elements.
 * @template I the type of id.
 */
export interface InternalCollectionOptions<E extends Element<I>, I> {
    /**
     * The name of collection.
     */
    name: string

    /** 
     * The comparator to compare the elements.
     */
    comparator: Comparator<I>

    /**
     * The elements of the collection.
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
 * the Iterable<E>.
 * 
 * @template E the type of elements.
 * @template I the type of id.
 */
export interface Collection<E extends Element<I>, I> extends Iterable<E> {
    /**
     * Inserts the element to the collection.
     * @param el the element to be inserted.
     * @returns whether it has inserted the element.
     */
    insert(el: E) : boolean

    /**
     * Updates the element by `Object.assign`.
     * @param id the id of element to be updated.
     * @param el the element to be updated, except 'id' property.
     * @returns whether it has updated the element.
     */
    update(id: I, el: Partial<Omit<E, 'id'>>) : boolean

    /**
     * Removes the element.
     * @param id the id of the element to be removed.
     * @returns whether it has removed the element.
     */
    remove(id: I) : boolean

    /**
     * Removes all elements that match the condition.
     * @param cond the condition to match the element to be removed.
     * @returns the number of elements it has removed.
     */
    removeAll(cond: Condition<E, I>) : number

    /**
     * Checks whether the element is in this collection.
     * @param id the id of element to be checked.
     * @returns whether the element is in this collection.
     */
    has(id: I) : boolean

    /**
     * Checks whether there is an element that matches the condition.
     * @param cond the condition to match the element to be checked.
     * @returns whether there is an element that matches the condition.
     */
    has(cond: Condition<E, I>) : boolean

    /**
     * Finds the element.
     * @param id the id of element to be found.
     * @returns the found element, or undefined if it hasn't found.
     */
    find(id: I) : Readonly<E> | undefined

    /**
     * Finds all elements that match given condition.
     * @param cond the condition to match the elements.
     * @returns all elements that match given condition.
     */
    findAll(cond: Condition<E, I>) : readonly E[]
}