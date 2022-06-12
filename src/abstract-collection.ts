import { Element, Collection, Condition, Comparator, Save, InternalCollectionOptions } from './collection'

/**
 * Provides the implementation of removeAll and findAll, and startSaving method
 * to save the elements to JSON file.
 */
export abstract class AbstractCollection<E extends Element<I>, I> implements Collection<E, I> {
    protected readonly comparator: Comparator<I>
    private readonly name: string
    private readonly save: Save
    private readonly elementsGetter: () => readonly E[]

    constructor(options: InternalCollectionOptions<E, I>, elementsGetter: () => readonly E[]) {
        this.comparator = options.comparator
        this.save = options.save
        this.name = options.name
        this.elementsGetter = elementsGetter
    }

    protected startSaving() : void {
        this.save(this.name, this.elementsGetter)
    }

    abstract insert(el: E): boolean
    abstract update(id: I, el: Partial<Omit<E, "id">>): boolean
    abstract remove(id: I): boolean
    abstract has(id: I): boolean
    abstract has(cond: Condition<E, I>): boolean
    abstract find(id: I): Readonly<E> | undefined
    abstract [Symbol.iterator](): Iterator<Readonly<E>>
    
    findAll(cond: Condition<E, I>): readonly E[] {
        const result = []
        for (const el of this) {
            if (cond(el)) result.push(el)
        }
        return result
    }

    removeAll(cond: Condition<E, I>): number {
        let length = 0
        for (const el of this) {
            if (cond(el)) {
                length++
                this.remove(el.id)
            }
        }
        return length
    }
}