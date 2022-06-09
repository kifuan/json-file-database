import { Collection, InternalCollectionOptions, Comparator, Condition, Save } from './collection'

export default class ArrayCollection<T extends object, P extends keyof T> implements Collection<T, P> {
    private readonly comparator: Comparator<T, P>
    private readonly name: string
    private readonly elements: T[]
    private readonly save: Save<T>

    constructor(options: InternalCollectionOptions<T, P>) {
        this.comparator = options.comparator
        this.save = options.save
        this.name = options.name
        this.elements = options.elements.sort(this.comparator)
    }

    private startSaving() {
        this.save(this.name, () => this.elements)
    }

    /**
     * @returns the index to insert or get, and whether it has found the element. 
     */
    private binarySearchIndex(el: Pick<T, P>) : [number, boolean] {
        let left = 0
        let right = this.elements.length - 1

        while (left <= right) {
            const mid = Math.floor((left + right) / 2)
            const cmp = this.comparator(el, this.elements[mid])

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

    insert(el: T): boolean {
        const [index, found] = this.binarySearchIndex(el)
        if (found) {
            return false
        }
        this.elements.splice(index, 0, el)
        this.startSaving()
        return true
    }

    update(el: Partial<T> & Pick<T, P>): boolean {
        const found = this.find(el)
        if (found === undefined) {
            return false
        }
        // We need to change the found result.
        Object.assign(found as T, el)
        this.startSaving()
        return true
    }

    remove(el: Pick<T, P>): boolean {
        // Removing elements won't make the array unsorted.
        const [index, found] = this.binarySearchIndex(el)
        if (!found) {
            return false
        }
        this.elements.splice(index, 1)
        this.startSaving()
        return true
    }

    removeAll(cond: Condition<T>): number {
        const elements = this.findAll(cond)
        const length = elements.length
        elements.forEach(el => this.remove(el))
        return length
    }

    has(el: Pick<T, P>): boolean
    has(cond: Condition<T>): boolean
    has(el: Pick<T, P> | Condition<T>): boolean {
        if (typeof el === 'function') {
            return this.elements.find(el) !== undefined
        }
        return this.find(el) !== undefined
    }

    find(el: Pick<T, P>): Readonly<T> | undefined {
        const [index, found] = this.binarySearchIndex(el)
        if (!found) {
            return undefined
        }
        return this.elements[index]
    }

    findAll(cond: Condition<T>): readonly T[] {
        return this.elements.filter(cond)
    }

    list(): readonly T[] {
        return this.elements
    }

    get length(): number {
        return this.elements.length
    }
}