import { Collection, Element, InternalCollectionOptions, Comparator, Condition, Save } from './collection'
import { AbstractCollection } from './abstract-collection'

export default class ArrayCollection<E extends Element<I>, I> extends AbstractCollection<E, I> {
    private readonly elements: E[]

    constructor(options: InternalCollectionOptions<E, I>) {
        super(options, () => this.elements)
        this.elements = options.elements.sort((a, b) => this.comparator(a.id, b.id))
    }

    /**
     * @returns the index to insert or get, and whether it has found the element. 
     */
    private binarySearchIndex(id: I) : [number, boolean] {
        let left = 0
        let right = this.elements.length - 1

        while (left <= right) {
            const mid = Math.floor((left + right) / 2)
            const cmp = this.comparator(id, this.elements[mid].id)

            if (cmp < 0) {
                right = mid - 1
            } else if (cmp > 0) {
                left = mid + 1
            } else {
                return [mid, true]
            }
        }

        return [left, false]
    }

    *[Symbol.iterator]() : Iterator<E> {
        for (let i = 0; i < this.elements.length; i++) {
            yield this.elements[i]
        }
    }

    insert(el: E): boolean {
        const [index, found] = this.binarySearchIndex(el.id)
        if (found) {
            return false
        }
        this.elements.splice(index, 0, el)
        this.startSaving()
        return true
    }

    update(id: I, el: Partial<Omit<E, 'id'>>): boolean {
        const [index, found] = this.binarySearchIndex(id)
        if (!found) {
            return false
        }
        // We need to change the found result.
        Object.assign(this.elements[index], el)
        this.startSaving()
        return true
    }

    remove(id: I): boolean {
        // Removing elements won't make the array unsorted.
        const [index, found] = this.binarySearchIndex(id)
        if (!found) {
            return false
        }
        this.elements.splice(index, 1)
        this.startSaving()
        return true
    }

    has(id: I): boolean
    has(cond: Condition<E, I>): boolean
    has(id: I | Condition<E, I>): boolean {
        if (typeof id === 'function') {
            return this.elements.find(id as Condition<E, I>) !== undefined
        }
        return this.find(id) !== undefined
    }

    find(id: I): Readonly<E> | undefined {
        const [index, found] = this.binarySearchIndex(id)
        if (!found) {
            return undefined
        }
        return this.elements[index]
    }
}