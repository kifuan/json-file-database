import { Collection, Condition, Comparator, CollectionOptions, Save } from './collection'

type Node<T> = {
    val: T
    height: number
    left?: Node<T>
    right?: Node<T>
}

class AVLTree<T extends object, P extends keyof T> {
    private root: Node<T> | undefined
    private comparator: Comparator<T, P>

    constructor(comparator: Comparator<T, P>) {
        this.comparator = comparator
    }

    find(val: Pick<T, P>) : T | undefined {
        return this.pFind(this.root, val)?.val
    }

    remove(val: Pick<T, P>) {
        const { node, removed } = this.pRemove(this.root, val)
        this.root = node
        return removed
    }

    insert(val: T) {
        const { node, inserted } = this.pInsert(this.root, val)
        this.root = node
        return inserted
    }

    list() : T[] {
        const result = [] as T[]
        this.pList(result, this.root)
        return result
    }

    get count() : number {
        return this.pCount(this.root)
    }

    private pList(result: T[], node: Node<T> | undefined) {
        if (node === undefined) {
            return
        }
        this.pList(result, node.left)
        result.push(node.val)
        this.pList(result, node.right)
    }

    private pCount(node: Node<T> | undefined) : number {
        if (node === undefined) {
            return 0
        }
        return this.pCount(node.left) + this.pCount(node.right) + 1
    }


    private height(node: Node<T> | undefined) {
        return node ? node.height : -1
    }

    private calcHeight(node: Node<T>) : number {
        return Math.max(this.height(node.left), this.height(node.right)) + 1
    }

    private rotateLL(k1: Node<T>) : Node<T> {
        const k2 = k1.left!
        
        k2.right = k1
        k1.left = k2.right

        k1.height = this.calcHeight(k1)
        k2.height = this.calcHeight(k2)

        return k2
    }

    private rotateRR(k1: Node<T>) : Node<T> {
        const k2 = k1.right!
        k1.right = k2.left
        k2.left = k1

        k1.height = this.calcHeight(k1)
        k2.height = this.calcHeight(k2)

        return k2
    }

    private rotateLR(k3: Node<T>) : Node<T> {
        k3.left = this.rotateRR(k3.left!)
        return this.rotateLL(k3)
    }

    private rotateRL(k3: Node<T>) : Node<T> {
        k3.right = this.rotateLL(k3.right!)
        return this.rotateRR(k3)
    }

    private factor(node: Node<T>) : number {
        return this.height(node.left) - this.height(node.right)
    }

    private balance(node: Node<T>) : Node<T> {
        if (this.factor(node) > 1) {
            // Left is higher.
            if (this.factor(node.left!) < 0) {
                node = this.rotateLR(node)
            } else {
                node = this.rotateLL(node)
            }
        } else if (this.factor(node) < -1) {
            // Right is higher.
            if (this.factor(node.right!) > 0) {
                node = this.rotateRL(node)
            } else {
                node = this.rotateRR(node)
            }
        }

        // Anyway, reset the height.
        node.height = this.calcHeight(node)
        return node
    }

    private pInsert(node: Node<T> | undefined, val: T) : { node: Node<T>, inserted: boolean } {
        if (node === undefined) {
            return { node: { val, height: 0 }, inserted: true }
        }

        let inserted = false
        const cmp = this.comparator(val, node.val)

        if (cmp < 0) {
            const result = this.pInsert(node.left, val)
            node.left = result.node
            inserted = result.inserted
        } else if (cmp > 0) {
            const result = this.pInsert(node.right, val)
            node.right = result.node
            inserted = result.inserted
        }
        node = this.balance(node)
        return { node, inserted }
    }

    private pFind(node: Node<T> | undefined, val: Pick<T, P>) : Node<T> | undefined {
        if (node === undefined) {
            return undefined
        }

        const cmp = this.comparator(val, node.val)

        if (cmp < 0) {
            return this.pFind(node.left, val)
        } else if (cmp > 0) {
            return this.pFind(node.right, val)
        }

        return node
    }

    private pRemove(node: Node<T> | undefined, val: Pick<T, P>) : { node: Node<T> | undefined, removed: boolean } {
        if (node === undefined) {
            return { node, removed: false }
        }

        const cmp = this.comparator(val, node.val)
        let removed = false

        if (cmp < 0) {
            const result = this.pRemove(node.left, val)
            node.left = result.node
            removed = result.removed
        } else if (cmp > 0) {
            const result = this.pRemove(node.right, val)
            node.right = result.node
            removed = result.removed
        } else if (node.left !== undefined && node.right !== undefined) {
            let min = node.right!
            while (min.left !== undefined) {
                min = min.left
            }
            node.val = min.val
            removed = true
            node.right = this.pRemove(node.right, node.val).node
        } else {
            node = node.left || node.right
            removed = true
        }

        node = node === undefined ? node : this.balance(node)
        return { node, removed }
    }
}

export class AVLCollection<T extends object, P extends keyof T> implements Collection<T, P> {
    #name: string
    #save: Save<T>
    #tree: AVLTree<T, P>

    private save() {
        this.#save(this.#name, () => this.list())
    }

    constructor(options: CollectionOptions<T, P>) {
        this.#save = options.save
        this.#name = options.name
        this.#tree = new AVLTree<T, P>(options.comparator)
        options.elements.forEach(el => this.#tree.insert(el))
    }

    insert(el: T): boolean {
        const result = this.#tree.insert(el)
        result && this.save()
        return result
    }

    update(el: Partial<T> & Pick<T, P>): boolean {
        const obj = this.find(el)
        if (obj === undefined) {
            return false
        }
        Object.assign(obj, el)
        this.save()
        return true
    }

    remove(el: Pick<T, P>): boolean {
        const result = this.#tree.remove(el)
        result && this.save()
        return result
    }

    removeAll(cond: Condition<T>): number {
        const elements = this.findAll(cond)
        const length = elements.length
        elements.forEach(el => this.remove(el))
        return length
    }

    has(el: Pick<T, P>): boolean
    has(cond: Condition<T>): boolean
    has(cond: Pick<T, P> | Condition<T>): boolean {
        if (typeof cond === 'function') {
            return this.findAll(cond).length !== 0
        }
        return this.find(cond) !== undefined
    }

    find(el: Pick<T, P>): Readonly<T> | undefined {
        return this.#tree.find(el)
    }

    findAll(cond: Condition<T>): readonly T[] {
        return this.list().filter(cond)
    }

    list(): readonly T[] {
        return this.#tree.list()
    }

    get length(): number {
        return this.#tree.count
    }
}
