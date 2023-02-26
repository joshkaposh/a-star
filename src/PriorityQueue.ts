export default class PriorityQueue<T> {
    #list: {
        item: T;
        priority: number
    }[] = [];
    #capacity: number;

    constructor(capacity: number) {
        this.#capacity = Math.max(Number(capacity), 0);
    }

    get size() {
        return this.#list.length;
    }

    get isFull() {
        return this.#capacity !== null && this.size === this.#capacity;
    }

    get isEmpty() {
        return this.size === 0;
    }

    #addToList(element: { item: T, priority: number }) {
        // add element to end if priority is greater than last element
        if (this.isEmpty || element.priority >= this.#list[this.size - 1].priority) {
            this.#list.push(element);
        } else {
            for (let index in this.#list) {
                // add element in first spot where priority is higher
                if (element.priority < this.#list[index].priority) {
                    this.#list.splice(parseInt(index), 0, element);
                    break;
                }
            }
        }
    }

    add(item: T, priority = 0) {
        priority = Math.max(Number(priority), 0);
        const element = { item, priority };

        this.#addToList(element);
    }
    remove() {
        return this.isEmpty ? null : this.#list.shift()!.item;
    }

    peek() {
        return this.#list[0].item;
    }

    contains(item: unknown) {
        for (let index in this.#list) {
            // console.log(this.#list[index].item, item);
            if (this.#list[index].item === item) {
                return true;
            }
        }
        return false;
    }

    clear() {
        this.#list.length = 0;
    }

    clone() {
        const queue = new PriorityQueue(this.#capacity);
        let temp = this.copy();
        for (let i = 0; i < temp.length; i++) {
            queue.add(temp[i].item, temp[i].priority);
        }
        return queue;
    }

    copy() {
        const temp: {
            item: T;
            priority: number
        }[] = [];
        for (let index in this.#list) {
            temp[parseInt(index)] = this.#list[index];
        }

        return temp;
    }

    toString() {
        return this.#list.map((el) => el.item).toString();
    }
}
