export default class ReactiveMap {
    subscribers: Map<string | number | symbol, Set<(value: any) => void>>;

    //
    constructor() {
        this.subscribers = new Map();
    }

    //
    ["@subscribe"](prop: string | number | symbol, cb: (value: any) => void) {
        if (this.subscribers.has(prop)) {
            this.subscribers.get(prop)?.add?.(cb);
        } else {
            this.subscribers.set(prop, new Set([cb]));
        }
    }

    //
    has(target, prop: string | number | symbol) {
        if (prop == "@subscribe") {return false;};
        if (prop == "@extract") {return false;};
        return Reflect.has(target, prop);
    }

    //
    get(target, name: string | number | symbol, ctx) {
        if (name == "@subscribe") {
            return (prop: string, cb: (value: any) => void) => {
                if (target.has(prop)) {
                    cb?.(target.get(prop));
                }
                this["@subscribe"](prop, cb);
            };
        }

        //
        if (name == "@extract") {
            return target;
        }

        //
        if (name == "delete") {
            return (prop, value = null) => {
                Array.from(this.subscribers.get(prop)?.values?.() || []).map((cb: (value: any) => void) => cb(value));
                (Reflect.get(target, name, ctx))(prop, value);
            };
        }

        //
        if (name == "set") {
            return (prop, value) => {
                Array.from(this.subscribers.get(prop)?.values?.() || []).map((cb: (value: any) => void) => cb(value));
                (Reflect.get(target, name, ctx))(prop, value);
            };
        }

        //
        return Reflect.get(target, name, ctx);
    }
}

//
export const makeReactiveMap: <K, V>(map: Map<K, V>) => Map<K, V> = <K, V>(map: Map<K, V>) => new Proxy(map, new ReactiveMap() as ProxyHandler<Map<K, V>>);
export const createReactiveMap: <K, V>(map: [K, V][]) => Map<K, V> = <K, V>(map: [K, V][] = []) => new Proxy(new Map(map), new ReactiveMap() as ProxyHandler<Map<K, V>>);
