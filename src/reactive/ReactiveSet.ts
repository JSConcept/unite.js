const bindCtx = (target, fx) => {
    return (typeof fx == "function" ? fx?.bind?.(target) : fx) ?? fx;
}

//
type keyType = string | number | symbol;

//
export default class ReactiveSet {
    subscribers: Map<any, Set<(value: any) => void>>;
    listeners: Set<(value: any) => void>;

    //
    constructor() {
        this.subscribers = new Map();
        this.listeners = new Set();
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
    has(target, prop: keyType) {
        if (prop == "@subscribe") {return false;};
        if (prop == "@extract") {return false;};
        return Reflect.has(target, prop);
    }

    //
    get(target, name: keyType, ctx) {
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
                return bindCtx(target, Reflect.get(target, name, ctx))(value, value);
            };
        }

        //
        if (name == "add") {
            return (value) => {
                Array.from(this.subscribers.get(value)?.values?.() || []).map((cb: (value: any) => void) => cb(value));
                Array.from(this.listeners?.values?.() || []).map((cb: (value: any) => void) => cb(value));
                return bindCtx(target, Reflect.get(target, name, ctx))(value, value);
            };
        }

        //
        return bindCtx(target, Reflect.get(target, name, ctx));
    }

    //
    construct(target, args, newT) {
        return Reflect.construct(target, args, newT);
    }

    //
    apply(target, ctx, args) {
        return Reflect.apply(target, ctx, args);
    }
}

// 
export const makeReactiveSet: <V>(map: Set<V>) => Set<V> = <V>(set: Set<V>) => new Proxy(set, new ReactiveSet() as ProxyHandler<Set<V>>);
export const createReactiveSet: <V>(map: V[]) => Set<V> = <V>(set: V[] = []) => new Proxy(new Set(set), new ReactiveSet() as ProxyHandler<Set<V>>);
