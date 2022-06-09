/**
 * The condition to to compare objects.
 */
export type Condition<T extends object> = (obj: T) => boolean

/**
 * The comparator to compare the objects.
 * Different from Condition, it can tell which object is greater or smaller.
 */
export type Comparator<T extends object, P extends keyof T> = (first: Pick<T, P>, second: Pick<T, P>) => number

/**
 * The function to save the collection.
 */
export type Save<T> = (name: string, elements: () => readonly T[]) => void

/**
 * The options when creating a collection.
 * @template T the type of elements.
 * @template P the prime key of the type.
 */
export type InternalCollectionOptions<T extends object, P extends keyof T> = {
    /**
     * The name of collection.
     */
    name: string

    /** 
     * The comparator to compare the elements.
     */
    comparator: Comparator<T, P>

    /**
     * The elements for the collection.
     */
    elements: T[]

    /**
     * To save the collection.
     */
    save: Save<T>
}

/**
 * A collection is like an array.
 * You can insert, update, delete and find elements in it.
 * 
 * If you called methods that affect the collection,
 * it will start a so-called "debounced" function to save the data.
 * 
 * @template T the type of element.
 * @template P the prime key for element type.
 */
export interface Collection<T extends object, P extends keyof T> {
    /**
     * Inserts the element to the collection.
     * @param el the element to be inserted.
     * @returns whether it has inserted the element.
     */
    insert(el: T) : boolean

    /**
     * Updates the element by `Object.assign`.
     * @param el the element to be updated.
     * @returns whether it has updated the element.
     */
    update(el: Partial<T> & Pick<T, P>) : boolean

    /**
     * Removes the element.
     * @param el the element to be removed.
     * @returns whether it has removed the element.
     */
    remove(el: Pick<T, P>) : boolean

    /**
     * Removes all elements that match the condition.
     * @param cond the condition to match the element to be removed.
     * @returns the number of elements it has removed.
     */
    removeAll(cond: Condition<T>) : number

    /**
     * Checks whether the element is in this collection.
     * @param el the element to be checked.
     * @returns whether the element is in this collection.
     */
    has(el: Pick<T, P>) : boolean

    /**
     * Checks whether there is an element that matches the condition.
     * @param cond the condition to match the element to be checked.
     * @returns whether there is an element that matches the condition.
     */
    has(cond: Condition<T>) : boolean

    /**
     * Finds the element.
     * @param el the element to be found.
     * @returns the found element, or undefined if it hasn't found.
     */
    find(el: Pick<T, P>) : Readonly<T> | undefined

    /**
     * Finds all elements that match given condition.
     * @param cond the condition to match the elements.
     * @returns all elements that match given condition.
     */
    findAll(cond: Condition<T>) : readonly T[]

    /**
     * List all elements.
     * @returns all elements in this collection.
     */
    list() : readonly T[]

    /**
     * Gets the length of this collection.
     * @returns the length of this collection.
     */
    get length() : number
}
