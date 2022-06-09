import { Collection, Condition, Comparator, CollectionOptions, Save } from './collection'

type Node<T> = {
    val: T
    height: number
    left?: Node<T>
    right?: Node<T>
}

export class AVLCollection<T extends object, P extends keyof T> implements Collection<T, P> {
    private nodeHeight(node: Node<T> | undefined) {
        return node ? node.height : -1
    }

    private nodeCalcHeight(node: Node<T>) : number {
        return Math.max(this.nodeHeight(node.left), this.nodeHeight(node.right)) + 1
    }

    private nodeRotateWithLeftChild(k1: Node<T>) : Node<T> {
        const k2 = k1.left!
        k1.left = k2.right
        k2.right = k1

        k1.height = this.nodeCalcHeight(k1)
        k2.height = this.nodeCalcHeight(k2)

        return k2
    }

    private nodeRotateWithRightChild(k1: Node<T>) : Node<T> {
        const k2 = k1.right!
        k1.right = k2.left
        k2.left = k1

        k1.height = this.nodeCalcHeight(k1)
        k2.height = this.nodeCalcHeight(k2)

        return k2
    }

    private nodeDoubleRotateLeft(k3: Node<T>) : Node<T> {
        k3.left = this.nodeRotateWithRightChild(k3.left!)
        return this.nodeRotateWithLeftChild(k3)
    }

    private nodeDoubleRotateRight(k3: Node<T>) : Node<T> {
        k3.right = this.nodeRotateWithLeftChild(k3.right!)
        return this.nodeRotateWithRightChild(k3)
    }

    private nodeFactor(node: Node<T>) : number {
        return this.nodeHeight(node.left) - this.nodeHeight(node.right)
    }

    private nodeBalance(node: Node<T>) : Node<T> {
        if (this.nodeFactor(node) > 1) {
            // Left is higher.
            if (this.nodeFactor(node.left!) < 0) {
                node = this.nodeDoubleRotateLeft(node)
            } else {
                node = this.nodeRotateWithLeftChild(node)
            }
        } else if (this.nodeFactor(node) < -1) {
            // Right is higher.
            if (this.nodeFactor(node.right!) > 0) {
                node = this.nodeDoubleRotateRight(node)
            } else {
                node = this.nodeRotateWithRightChild(node)
            }
        }

        // Anyway, reset the height.
        node.height = this.nodeCalcHeight(node)
        return node
     }

    private nodeInsert(node: Node<T> | undefined, val: T) : { node: Node<T>, inserted: boolean } {
        if (node === undefined) {
            return { node: { val, height: 0 }, inserted: true }
        }

        let inserted = false
        const cmp = this.#comparator(val, node.val)

        if (cmp < 0) {
            const result = this.nodeInsert(node.left, val)
            node.left = result.node
            inserted = result.inserted
        } else if (cmp > 0) {
            const result = this.nodeInsert(node.right, val)
            node.right = result.node
            inserted = result.inserted
        }
        node = this.nodeBalance(node)
        return { node, inserted }
    }
    
    private nodeFind(node: Node<T> | undefined, val: Pick<T, P>) : Node<T> | undefined {
        if (node === undefined) {
            return undefined
        }

        const cmp = this.#comparator(val, node.val)

        if (cmp < 0) {
            return this.nodeFind(node.left, val)
        } else if (cmp > 0) {
            return this.nodeFind(node.right, val)
        }

        return node
    }

    private nodeReomve(node: Node<T> | undefined, val: Pick<T, P>) : { node: Node<T> | undefined, removed: boolean } {
        if (node === undefined) {
            return { node, removed: false }
        }

        const cmp = this.#comparator(val, node.val)
        let removed = false

        if (cmp < 0) {
            const result = this.nodeReomve(node.left, val)
            node.left = result.node
            removed = result.removed
        } else if (cmp > 0) {
            const result = this.nodeReomve(node.right, val)
            node.right = result.node
            removed = result.removed
        } else if (node.left !== undefined && node.right !== undefined) {
            let min = node.right!
            while (min.left !== undefined) {
                min = min.left
            }
            node.val = min.val
            removed = true
            node.right = this.nodeReomve(node.right, node.val).node
        } else {
            node = node.left || node.right
            removed = true
        }

        node = node === undefined ? node : this.nodeBalance(node)
        return { node, removed }
    }

    private save() {
        this.#save(this.#name, () => this.list())
    }

    #comparator: Comparator<T, P>
    #name: string
    #save: Save<T>
    #root: Node<T> | undefined

    constructor(options: CollectionOptions<T, P>) {
        this.#comparator = options.comparator
        this.#save = options.save
        this.#name = options.name
        options.elements.forEach(el => this.insert(el))
    }

    insert(el: T): boolean {
        const result = this.nodeInsert(this.#root, el)
        this.#root = result.node
        if (result.inserted) {
            this.save()
        }
        return result.inserted
    }

    update(el: Partial<T> & Pick<T, P>): boolean {
        const node = this.nodeFind(this.#root, el)
        if (node === undefined) {
            return false
        }
        Object.assign(node.val, el)
        this.save()
        return true
    }

    remove(el: Pick<T, P>): boolean {
        const result = this.nodeReomve(this.#root, el)
        this.#root = result.node
        if (result.removed) {
            this.save()
        }
        return result.removed
    }

    removeAll(cond: Condition<T>): void {
        this.findAll(cond).forEach(el => this.remove(el))
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
        return this.nodeFind(this.#root, el)?.val
    }

    findAll(cond: Condition<T>): readonly T[] {
        return this.list().filter(cond)
    }


    private listNodes(res: T[], node: Node<T> | undefined) {
        if (node === undefined) {
            return
        }
        // Inorder iterate this tree.
        this.listNodes(res, node.left)
        res.push(node.val)
        this.listNodes(res, node.right)
    }

    list(): readonly T[] {
        const result = [] as T[]
        this.listNodes(result, this.#root)
        return result
    }

    private count(node?: Node<T>) : number {
        if (node === undefined) {
            return 0
        }
        return this.count(node.left) + this.count(node.right) + 1
    }

    get length(): number {
        return this.count(this.#root)
    }
}
