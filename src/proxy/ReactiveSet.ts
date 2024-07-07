export default class ReactiveSet {
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
            return (value) => {
                Array.from(this.subscribers.get(value)?.values?.() || []).map((cb: (value: any) => void) => cb(value));
                (Reflect.get(target, name, ctx))(value, value);
            };
        }

        //
        if (name == "add") {
            return (value) => {
                Array.from(this.subscribers.get(value)?.values?.() || []).map((cb: (value: any) => void) => cb(value));
                (Reflect.get(target, name, ctx))(value, value);
            };
        }

        //
        return Reflect.get(target, name, ctx);
    }
}

// 
export const makeReactiveSet: <V>(map: Set<V>) => Set<V> = <V>(set: Set<V>) => new Proxy(set, new ReactiveSet() as ProxyHandler<Set<V>>);
export const createReactiveSet: <V>(map: V[]) => Set<V> = <V>(set: V[] = []) => new Proxy(new Set(set), new ReactiveSet() as ProxyHandler<Set<V>>);
