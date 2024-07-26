import {UUIDv4} from "../utils/Utils.ts";

//
export class UUIDMap {
    #weakMap = new WeakMap<object, string>();
    #registry = new FinalizationRegistry((_: string) => {});
    #refMap = new Map<string, WeakRef<object>>();

    //
    constructor() {
        this.#weakMap = new WeakMap<object, string>();
        this.#refMap = new Map<string, WeakRef<object>>();

        //
        this.#registry = new FinalizationRegistry((key: string) => {
            this.#refMap.delete(key);
        });
    }

    //
    add(obj: object, id: string = "") {
        if (!(typeof obj == "object" || typeof obj == "function")) return obj;

        // never override already added
        if (id && this.#refMap.has(id)) {id = UUIDv4();}

        //
        if (this.#weakMap.has(obj)) {
            this.#weakMap.get(obj);
        }

        //
        this.#weakMap.set(obj, (id ||= UUIDv4()));
        this.#refMap.set(id, new WeakRef(obj));
        this.#registry.register(obj, id);

        // holding from GC
        setTimeout(
            (obj) => {
                return obj;
            },
            1000,
            obj
        );

        //
        return id;
    }

    //
    get<T extends object | string>(key: T): T extends object ? string : object {
        if (typeof key == "object" || typeof key == "function") {
            return this.#weakMap.get(<object>(<unknown>key)) as any;
        }
        return this.#refMap.get(<string>(<unknown>key))?.deref() as any;
    }
}