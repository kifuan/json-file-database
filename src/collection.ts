export type Condition<T> = (obj: T) => boolean

/**
 * The options of creating a collection.
 */
export type CollectionOptions<T> = {
    /**
     * The elements in array.
     */
    elements: T[]

    /**
     * The function to save the data.
     */
    save: () => void
}

/**
 * A collection is like an array.
 * You can insert, update, delete and find members in it.
 * 
 * If you called methods that affect the collection,
 * it will start a so-called "debounced" function to save the data.
 */
export class Collection<T> {
    private readonly options: CollectionOptions<T>

    /**
     * YOU SHOULD NOT CREATE COLLECTION BY YOURSELF.
     * CALL THE RESULT OF connect OR connectSync.
     * @param options the options of this collection
     */
    constructor(options: CollectionOptions<T>) {
        this.options = options
    }

    private save() : void {
        this.options.save.apply(undefined)
    }

    /**
     * Inserts given data to the collection.
     * @param data the data to be inserted
     */
    insert(...data: T[]) : void {
        const { elements } = this.options
        elements.push(...data)
        this.save()
    }

    /**
     * Updates the data that matches given condition.
     * @param data the data to be updated
     * @param cond the condition to match elements
     * @return whether the data is updated
     */
    update(data: Partial<T> | T, cond: Condition<T>) : boolean {
        const { elements } = this.options
        const index = elements.findIndex(cond)

        if (index === -1) {
            return false
        }

        const found = elements[index]

        if (found instanceof Object) {
            Object.assign(found, data)
        } else {
            // Primitive types have no properties,
            // so it must be the type itself.
            elements[index] = data as T
        }

        this.save()
        return true
    }

    /**
     * Deletes the data that matches given condition.
     * @param cond the condition to match elements
     * @return whether the data is deleted
     */
    delete(cond: Condition<T>) : boolean {
        const { elements } = this.options
        const index = elements.findIndex(cond)
        if (index === -1) {
            return false
        }
        elements.splice(index, 1)
        this.save()
        return true
    }

    /**
     * Finds the data.
     * @param cond the condition to find
     * @returns the data that matches given condition, or undefined if there is not
     */
    find(cond: Condition<T>) : T | undefined {
        const { elements } = this.options
        return elements.find(cond)
    }

    /**
     * The length of this collection.
     */
    get length() {
        const { elements } = this.options
        return elements.length
    }
}