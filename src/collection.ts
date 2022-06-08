export type Predicate<T> = (obj: T) => boolean

export type CollectionOptions<T> = {
    delay: number
    data: any
    name: string
    save: () => Promise<void>
}

export class Collection<T> {
    private readonly options: CollectionOptions<T>
    private timeout: NodeJS.Timeout | undefined

    constructor(options: CollectionOptions<T>) {
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

    private startSaving() {
        const { save, delay } = this.options

        // Does "function debounce" here.
        clearTimeout(this.timeout)
        this.timeout = setTimeout(() => {
            this.timeout = undefined
            save()
        }, delay)
    }

    insert(...data: T[]) : void {
        this.array.push(...data)
        this.startSaving()
    }

    update(data: T, predicate: Predicate<T>) : boolean {
        const index = this.array.findIndex(predicate)
        if (index === -1) {
            return false
        }
        this.array[index] = data
        this.startSaving()
        return true
    }

    delete(predicate: Predicate<T>) : boolean {
        const index = this.array.findIndex(predicate)
        if (index === -1) {
            return false
        }
        this.array.splice(index, 1)
        this.startSaving()
        return true
    }

    find(predicate: Predicate<T>) : T | undefined {
        return this.array.find(predicate)
    }
}