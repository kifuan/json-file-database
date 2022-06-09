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
 * The options when creating a collection.
 */
export type CollectionOptions<T extends object, P extends keyof T> = {
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
    save: (name: string, elements: () => T[]) => void
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
     */
    insert(el: T) : boolean

    /**
     * Updates the element by `Object.assign`.
     * @param el the element to be updated.
     */
    update(el: Partial<T> & Pick<T, P>) : boolean

    /**
     * Removes the element.
     * @param el the element to be removed.
     */
    remove(el: Pick<T, P>) : boolean

    /**
     * Removes all elements that match the condition.
     * @param cond the condition to match the element to be removed.
     */
    removeAll(cond: Condition<T>) : void

    /**
     * Checks whether the element is in this collection.
     * @param el the element to be checked.
     */
    has(el: Pick<T, P>) : boolean

    /**
     * Checks whether there is an element matches the condition.
     * @param cond the condition to match the element to be checked.
     */
    has(cond: Condition<T>) : boolean

    /**
     * Finds the element.
     * @param el the element to be found.
     */
    find(el: Pick<T, P>) : Readonly<T> | undefined

    /**
     * Finds all elements that match given condition.
     * @param cond the condition to match the elements.
     */
    findAll(cond: Condition<T>) : Readonly<T[]>

    /**
     * List all elements.
     */
    list() : Readonly<T[]>

    /**
     * Gets the length of this collection.
     */
    get length() : number
}
