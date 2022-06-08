/**
 * The condition used to compare values.
 */
export type Condition<T> = (obj: T) => boolean

/**
 * The options of creating a collection.
 */
type CollectionOptions<T> = {
    /**
     * The elements in array.
     */
    elements: T[]

    /**
     * The function to save the data.
     */
    save: () => void
}

function toCondition<T>(cond: Condition<T> | T) : Condition<T> {
    if (typeof cond !== 'function') {
        return n => n === cond
    }
    return cond as Condition<T>
}

/**
 * A collection is like an array.
 * You can insert, update, delete and find members in it.
 * 
 * If you called methods that affect the collection,
 * it will start a so-called "debounced" function to save the data.
 * 
 * You should not create the collection by yourself.
 * It is created by Database object.
 */
export class Collection<T> {
    private readonly elements: T[]
    private readonly save: () => void

    constructor(options: CollectionOptions<T>) {
        this.elements = options.elements
        this.save = options.save
    }

    /**
     * Inserts given elements to the collection.
     * @param els the elements to be inserted
     */
    insert(...els: T[]) : void {
        this.elements.push(...els)
        this.save()
    }

    /**
     * Updates the element that matches given condition.
     * @param el the element to be updated
     * @param cond the condition to match the element
     * @return whether the element is updated
     */
    update(el: Partial<T> | T, cond: Condition<T> | T) : boolean {
        const index = this.elements.findIndex(toCondition(cond))
        if (index === -1) {
            return false
        }

        const found = this.elements[index]
        if (found instanceof Object) {
            Object.assign(found, el)
        } else {
            // Primitive types have no properties,
            // so it must be the type itself.
            this.elements[index] = el as T
        }
        this.save()
        return true
    }

    /**
     * Deletes the element that matches given condition.
     * @param cond the condition to match the element
     * @return whether the element is deleted
     */
    delete(cond: Condition<T> | T) : boolean {
        const index = this.elements.findIndex(toCondition(cond))
        if (index === -1) {
            return false
        }

        this.elements.splice(index, 1)
        this.save()
        return true
    }

    /**
     * Finds the element.
     * @param cond the condition to match the element
     * @returns the element that matches given condition, or undefined if there is not
     */
    find(cond: Condition<T> | T) : T | undefined {
        return this.elements.find(toCondition(cond))
    }

    /**
     * Finds all elements that match given condition.
     * It's better pass a function to match the elements.
     * @param cond the condition to match elements
     * @return all elements that match given condition
     */
    findAll(cond: Condition<T> | T) : T[] {
        return this.elements.filter(toCondition(cond))
    }

    /**
     * Checks whether there is a element that matches given condition.
     * @param cond the condition to match the element
     * @return whether there is a matched element
     */
    has(cond: Condition<T> | T) : boolean {
        return this.find(cond) !== undefined
    }

    /**
     * Lists all elements the collection has.
     * It will deep copy these elements.
     * @return all elements it has
     */
    list() : T[] {
        // Deep copy the elements.
        return JSON.parse(JSON.stringify(this.elements))
    }

    /**
     * The length of this collection.
     */
    get length() : number {
        return this.elements.length
    }
}