export default class ReactiveObject {
    subscribers: Map<string | number | symbol, Set<(value: any, prop: string | number | symbol) => void>>;
    listeners: Set<(value: any, prop: string | number | symbol) => void>;

    //
    constructor() {
        this.subscribers = new Map();
    }

    //
    ["@subscribe"](cb: (value: any, prop: string | number | symbol) => void, prop: string | number | symbol) {
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
    get(target, name: string | number | symbol, ctx) {
        if (name == "@subscribe") {
            return (prop: string, cb: (value: any) => void) => {
                cb?.(Reflect.get(target, prop, ctx));
                this["@subscribe"](cb, prop);
            };
        }
        if (name == "@extract") {
            return target;
        }
        return Reflect.get(target, name, ctx);
    }

    //
    construct(target, args, newT) {
        return Reflect.construct(target, args, newT);
    }

    //
    has(target, prop: string | number | symbol) {
        if (prop == "@subscribe") {return false;};
        if (prop == "@extract") {return false;};
        return Reflect.has(target, prop);
    }

    //
    apply(target, ctx, args) {
        return Reflect.apply(target, ctx, args);
    }

    //
    set(target, name: string | number | symbol, value) {
        Array.from(this.subscribers.get(name)?.values?.() || []).map((cb: (value: any, prop: string | number | symbol) => void) => cb(value, name));
        Array.from(this.listeners?.values?.() || []).map((cb: (value: any, prop: string | number | symbol) => void) => cb(value, name));
        return Reflect.set(target, name, value);
    }

    //
    deleteProperty(target, name: string | number | symbol) {
        Array.from(this.subscribers.get(name)?.values?.() || []).map((cb: (value: any, prop: string | number | symbol) => void) => cb(null, name));
        Array.from(this.listeners?.values?.() || []).map((cb: (value: any, prop: string | number | symbol) => void) => cb(null, name));
        return Reflect.deleteProperty(target, name);
    }
}

//
export const makeReactiveObject: <T extends object>(map: T) => T = <T extends object>(obj: T) => new Proxy<T>(obj, (new ReactiveObject()) as ProxyHandler<T>);
