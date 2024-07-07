export default class ReactiveSet {
    subscribers: Map<any, Set<(value: any) => void>>;
    listeners: Set<(value: any) => void>;

    //
    constructor() {
        this.subscribers = new Map();
    }

    //
    ["@subscribe"](cb: (value: any) => void, value: any) {
        if (value) {
            if (this.subscribers.has(value)) {
                this.subscribers.get(value)?.add?.(cb);
            } else {
                this.subscribers.set(value, new Set([cb]));
            }
        } else {
            this.listeners.add?.(cb);
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
            return (cb: (value: any) => void, value: string) => {
                if (target.has(value)) {
                    cb?.(target.get(value));
                }
                this["@subscribe"](cb, value);
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
                Array.from(this.listeners?.values?.() || []).map((cb: (value: any) => void) => cb(value));
                (Reflect.get(target, name, ctx))(value, value);
            };
        }

        //
        if (name == "add") {
            return (value) => {
                Array.from(this.subscribers.get(value)?.values?.() || []).map((cb: (value: any) => void) => cb(value));
                Array.from(this.listeners?.values?.() || []).map((cb: (value: any) => void) => cb(value));
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
