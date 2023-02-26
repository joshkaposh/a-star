export default class Input {
    #keys = new Map<string, boolean>();
    #lastKey: string | null = null;

    constructor() {
        window.addEventListener("keydown", (e) => {
            this.#keys.set(e.code, true)
            this.#lastKey = e.code;
        });

        window.addEventListener("keyup", (e) => {
            this.#keys.delete(e.code)
        });
    }

    getKey(key: string) {
        return this.#keys.get(key)
    }

    get keys() {
        return this.#keys;
    }

    get lastKey() {
        return this.#lastKey;
    }
}
