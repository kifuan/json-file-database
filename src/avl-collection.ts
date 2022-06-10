import { Collection, Element, Condition, Comparator, InternalCollectionOptions, Save } from './collection'

type Node<E> = {
    el: E
    height: number
    left?: Node<E>
    right?: Node<E>
}
class AVLTree<E extends Element<I>, I> implements Iterable<E> {
    private root: Node<E> | undefined
    private comparator: Comparator<I>

    constructor(comparator: Comparator<I>) {
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

    find(id: I) : E | undefined {
        return this.pFind(this.root, id)?.el
    }

    remove(id: I) {
        const { node, removed } = this.pRemove(this.root, id)
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

    private pFind(node: Node<E> | undefined, id: I) : Node<E> | undefined {
        if (node === undefined) {
            return undefined
        }

        const cmp = this.comparator(id, node.el.id)

        if (cmp < 0) {
            return this.pFind(node.left, id)
        } else if (cmp > 0) {
            return this.pFind(node.right, id)
        }

        return node
    }

    private pRemove(node: Node<E> | undefined, id: I) : { node: Node<E> | undefined, removed: boolean } {
        if (node === undefined) {
            return { node, removed: false }
        }

        const cmp = this.comparator(id, node.el.id)
        let removed = false

        if (cmp < 0) {
            const result = this.pRemove(node.left, id)
            node.left = result.node
            removed = result.removed
        } else if (cmp > 0) {
            const result = this.pRemove(node.right, id)
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

export default class AVLCollection<E extends Element<I>, I> implements Collection<E, I> {
    private readonly name: string
    private readonly save: Save
    private readonly tree: AVLTree<E, I>

    private startSaving() {
        this.save(this.name, () => Array.from(this))
    }

    constructor(options: InternalCollectionOptions<E, I>) {
        this.save = options.save
        this.name = options.name
        this.tree = new AVLTree<E, I>(options.comparator)
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

    update(id: I, el: Partial<Omit<E, 'id'>>): boolean {
        const obj = this.find(id)
        if (obj === undefined) {
            return false
        }
        Object.assign(obj, el)
        this.startSaving()
        return true
    }

    remove(id: I): boolean {
        const result = this.tree.remove(id)
        result && this.startSaving()
        return result
    }

    removeAll(cond: Condition<E, I>): number {
        const elements = this.findAll(cond)
        const length = elements.length
        elements.forEach(el => this.remove(el.id))
        return length
    }

    has(id: I): boolean
    has(cond: Condition<E, I>): boolean
    has(cond: I | Condition<E, I>): boolean {
        if (typeof cond === 'function') {
            return this.findAll(cond as Condition<E, I>).length !== 0
        }
        return this.find(cond) !== undefined
    }

    find(id: I): Readonly<E> | undefined {
        return this.tree.find(id)
    }

    findAll(cond: Condition<E, I>): readonly E[] {
        const result: E[] = []

        for (const el of this) {
            if (cond(el)) {
                result.push(el)
            }
        }

        return result
    }
}
