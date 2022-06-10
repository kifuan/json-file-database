import { Collection, Element, Condition, Comparator, InternalCollectionOptions, Save } from './collection'

type Node<E> = {
    el: E
    height: number
    left?: Node<E>
    right?: Node<E>
}
class AVLTree<E extends Element<K>, K> implements Iterable<E> {
    private root: Node<E> | undefined
    private comparator: Comparator<K>

    constructor(comparator: Comparator<K>) {
        this.comparator = comparator
    }

    *[Symbol.iterator]() : Iterator<E> {
        // Inorder iteration
        if (this.root === undefined) {
            return
        }

        const stack : Node<E>[] = []
        let cur: Node<E> | undefined = this.root

        while (stack.length !== 0 || cur !== undefined) {
            while (cur) {
                stack.push(cur)
                cur = cur.left
            }
            const n = stack.pop()!
            yield n.el
            cur = n.right
        }
    }

    find(key: K) : E | undefined {
        return this.pFind(this.root, key)?.el
    }

    remove(key: K) {
        const { node, removed } = this.pRemove(this.root, key)
        this.root = node
        return removed
    }

    insert(el: E) {
        const { node, inserted } = this.pInsert(this.root, el)
        this.root = node
        return inserted
    }

    private height(node: Node<E> | undefined) {
        return node ? node.height : -1
    }

    private calcHeight(node: Node<E>) : number {
        return Math.max(this.height(node.left), this.height(node.right)) + 1
    }

    private rotateLL(k1: Node<E>) : Node<E> {
        const k2 = k1.left!

        k1.left = k2.right
        k2.right = k1

        k1.height = this.calcHeight(k1)
        k2.height = this.calcHeight(k2)

        return k2
    }

    private rotateRR(k1: Node<E>) : Node<E> {
        const k2 = k1.right!

        k1.right = k2.left
        k2.left = k1

        k1.height = this.calcHeight(k1)
        k2.height = this.calcHeight(k2)

        return k2
    }

    private rotateLR(k3: Node<E>) : Node<E> {
        k3.left = this.rotateRR(k3.left!)
        return this.rotateLL(k3)
    }

    private rotateRL(k3: Node<E>) : Node<E> {
        k3.right = this.rotateLL(k3.right!)
        return this.rotateRR(k3)
    }

    private factor(node: Node<E>) : number {
        return this.height(node.left) - this.height(node.right)
    }

    private balance(node: Node<E>) : Node<E> {
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

    private pInsert(node: Node<E> | undefined, el: E) : { node: Node<E>, inserted: boolean } {
        if (node === undefined) {
            return { node: { el, height: 0 }, inserted: true }
        }

        let inserted = false
        const cmp = this.comparator(el.id, node.el.id)

        if (cmp < 0) {
            const result = this.pInsert(node.left, el)
            node.left = result.node
            inserted = result.inserted
        } else if (cmp > 0) {
            const result = this.pInsert(node.right, el)
            node.right = result.node
            inserted = result.inserted
        }
        node = this.balance(node)
        return { node, inserted }
    }

    private pFind(node: Node<E> | undefined, key: K) : Node<E> | undefined {
        if (node === undefined) {
            return undefined
        }

        const cmp = this.comparator(key, node.el.id)

        if (cmp < 0) {
            return this.pFind(node.left, key)
        } else if (cmp > 0) {
            return this.pFind(node.right, key)
        }

        return node
    }

    private pRemove(node: Node<E> | undefined, key: K) : { node: Node<E> | undefined, removed: boolean } {
        if (node === undefined) {
            return { node, removed: false }
        }

        const cmp = this.comparator(key, node.el.id)
        let removed = false

        if (cmp < 0) {
            const result = this.pRemove(node.left, key)
            node.left = result.node
            removed = result.removed
        } else if (cmp > 0) {
            const result = this.pRemove(node.right, key)
            node.right = result.node
            removed = result.removed
        } else if (node.left !== undefined && node.right !== undefined) {
            let min = node.right!
            while (min.left !== undefined) {
                min = min.left
            }
            node.el = min.el
            removed = true
            node.right = this.pRemove(node.right, node.el.id).node
        } else {
            node = node.left || node.right
            removed = true
        }

        node = node === undefined ? node : this.balance(node)
        return { node, removed }
    }
}

export default class AVLCollection<E extends Element<K>, K> implements Collection<E, K> {
    private readonly name: string
    private readonly save: Save
    private readonly tree: AVLTree<E, K>

    private startSaving() {
        this.save(this.name, () => Array.from(this))
    }

    constructor(options: InternalCollectionOptions<E, K>) {
        this.save = options.save
        this.name = options.name
        this.tree = new AVLTree<E, K>(options.comparator)
        options.elements.forEach(el => this.tree.insert(el))
    }

    [Symbol.iterator](): Iterator<E> {
        return this.tree[Symbol.iterator]()
    }

    insert(el: E): boolean {
        const result = this.tree.insert(el)
        result && this.startSaving()
        return result
    }

    update(key: K, el: Partial<Omit<E, 'id'>>): boolean {
        const obj = this.find(key)
        if (obj === undefined) {
            return false
        }
        Object.assign(obj, el)
        this.startSaving()
        return true
    }

    remove(key: K): boolean {
        const result = this.tree.remove(key)
        result && this.startSaving()
        return result
    }

    removeAll(cond: Condition<E, K>): number {
        const elements = this.findAll(cond)
        const length = elements.length
        elements.forEach(el => this.remove(el.id))
        return length
    }

    has(key: K): boolean
    has(cond: Condition<E, K>): boolean
    has(cond: K | Condition<E, K>): boolean {
        if (typeof cond === 'function') {
            return this.findAll(cond as Condition<E, K>).length !== 0
        }
        return this.find(cond) !== undefined
    }

    find(key: K): Readonly<E> | undefined {
        return this.tree.find(key)
    }

    findAll(cond: Condition<E, K>): readonly E[] {
        const result: E[] = []

        for (const el of this) {
            if (cond(el)) {
                result.push(el)
            }
        }

        return result
    }
}
