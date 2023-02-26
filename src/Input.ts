export default class Input {
    #keys = new Map<string, boolean>();
    #lastKey: string | null = null;
    static #instance: Input;
    private constructor() {
        window.addEventListener("keydown", (e) => {
            this.#keys.set(e.code, true)
            this.#lastKey = e.code;
        });

        window.addEventListener("keyup", (e) => {
            this.#keys.delete(e.code)
        });
    }

    static instance() {
        if (!Input.#instance) {
            Input.#instance = new Input();
        }
        return Input.#instance;
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
