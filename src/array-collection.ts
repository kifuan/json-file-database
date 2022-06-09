import { Collection, CollectionOptions, Comparator, Condition, Save } from './collection'

/**
 * @todo use binary search to keep the elements sorted.
 */
export class ArrayCollection<T extends object, P extends keyof T> implements Collection<T, P> {
    #comparator: Comparator<T, P>
    #name: string
    #elements: T[]
    #save: Save<T>

    constructor(options: CollectionOptions<T, P>) {
        this.#comparator = options.comparator
        this.#save = options.save
        this.#name = options.name
        this.#elements = options.elements
    }

    private save() {
        this.#save(this.#name, () => this.#elements)
    }

    insert(el: T): boolean {
        if (this.has(el)) {
            return false
        }
        this.#elements.push(el)
        this.#elements.sort(this.#comparator)
        this.save()
        return true
    }

    update(el: Partial<T> & Pick<T, P>): boolean {
        const found = this.find(el)
        if (found === undefined) {
            return false
        }
        // We need to change the found result.
        Object.assign(found as T, el)
        this.save()
        return true
    }

    remove(el: Pick<T, P>): boolean {
        const index = this.#elements.findIndex(e => this.#comparator(e, el) === 0)
        if (index === -1) {
            return false
        }
        this.#elements.splice(index, 1)
        this.save()
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
            return this.#elements.find(el) !== undefined
        }
        return this.find(el) !== undefined
    }

    find(el: Pick<T, P>): Readonly<T> | undefined {
        return this.#elements.find(e => this.#comparator(e, el) === 0)
    }

    findAll(cond: Condition<T>): Readonly<T[]> {
        return this.#elements.filter(cond)
    }

    list(): Readonly<T[]> {
        return this.#elements
    }

    get length(): number {
        return this.#elements.length
    }
}