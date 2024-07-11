const bindCtx = (target, fx) => {
    return (typeof fx == "function" ? fx?.bind?.(target) : fx) ?? fx;
}

//
type keyType = string | number | symbol;

//
export default class ReactiveMap {
    subscribers: Map<keyType, Set<(value: any, prop: keyType) => void>>;
    listeners: Set<(value: any, prop: keyType) => void>;

    //
    constructor() {
        this.subscribers = new Map();
        this.listeners = new Set();
    }

    //
    ["@subscribe"](cb: (value: any, prop: keyType) => void, prop: keyType) {
        if (prop) {
            if (this.subscribers.has(prop)) {
                this.subscribers.get(prop)?.add?.(cb);
            } else {
                this.subscribers.set(prop, new Set([cb]));
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
            return (cb: (value: any, prop: keyType) => void, prop: keyType) => {
                if (target.has(prop) || !prop) {
                    cb?.(target.get(prop), prop);
                }
                this["@subscribe"](cb, prop);
            };
        }

        //
        if (name == "@extract") {
            return target;
        }

        //
        if (name == "delete") {
            return (prop, value = null) => {
                const result = bindCtx(target, Reflect.get(target, name, ctx))(prop, value);
                Array.from(this.subscribers.get(prop)?.values?.() || []).map((cb: (value: any, prop: keyType) => void) => cb(value, prop));
                Array.from(this.listeners?.values?.() || []).map((cb: (value: any, prop: keyType) => void) => cb(value, prop));
                return result;
            };
        }

        //
        if (name == "set") {
            return (prop, value) => {
                const result = bindCtx(target, Reflect.get(target, name, ctx))(prop, value);
                Array.from(this.subscribers.get(prop)?.values?.() || []).map((cb: (value: any, prop: keyType) => void) => cb(value, prop));
                Array.from(this.listeners?.values?.() || []).map((cb: (value: any, prop: keyType) => void) => cb(value, prop));
                return result;
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
export const makeReactiveMap: <K, V>(map: Map<K, V>) => Map<K, V> = <K, V>(map: Map<K, V>) => new Proxy(map, new ReactiveMap() as ProxyHandler<Map<K, V>>);
export const createReactiveMap: <K, V>(map: [K, V][]) => Map<K, V> = <K, V>(map: [K, V][] = []) => new Proxy(new Map(map), new ReactiveMap() as ProxyHandler<Map<K, V>>);
