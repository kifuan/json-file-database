export type Predicate<T> = (obj: T) => boolean

export type CollectionOptions = {
    data: any
    name: string
    save: () => void
}

export class Collection<T> {
    private readonly options: CollectionOptions

    constructor(options: CollectionOptions) {
        this.options = options

        // Make sure that the collection will operate an array.
        if (!Array.isArray(this.array)) {
            throw new TypeError(`Property ${options.name} for given object must be an array.`)
        }
    }

    private get array() : T[] {
        const { data, name } = this.options
        return data[name] ||= []
    }

    private save() : void {
        this.options.save.apply(undefined)
    }

    insert(...data: T[]) : void {
        this.array.push(...data)
        this.save()
    }

    update(data: Partial<T> | T, predicate: Predicate<T>) : boolean {
        const index = this.array.findIndex(predicate)
        if (index === -1) {
            return false
        }
        const found = this.array[index]

        if (found instanceof Object) {
            Object.assign(found, data)
        } else {
            // Primitive types have no properties,
            // so it must be the type itself.
            this.array[index] = data as T
        }

        this.save()
        return true
    }

    delete(predicate: Predicate<T>) : boolean {
        const index = this.array.findIndex(predicate)
        if (index === -1) {
            return false
        }
        this.array.splice(index, 1)
        this.save()
        return true
    }

    find(predicate: Predicate<T>) : T | undefined {
        return this.array.find(predicate)
    }

    get length() {
        return this.array.length
    }
}