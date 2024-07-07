export default class ReactiveObject {
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
    get(target, name: string | number | symbol, ctx) {
        if (name == "@subscribe") {
            return (prop: string, cb: (value: any) => void) => {
                cb?.(Reflect.get(target, prop, ctx));
                this["@subscribe"](prop, cb);
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
        Array.from(this.subscribers.get(name)?.values?.() || []).map((cb: (value: any) => void) => cb(value));
        return Reflect.set(target, name, value);
    }

    //
    deleteProperty(target, name: string | number | symbol) {
        Array.from(this.subscribers.get(name)?.values?.() || []).map((cb: (value: any) => void) => cb(null));
        return Reflect.deleteProperty(target, name);
    }
}

//
export const makeReactiveObject: <T extends object>(map: T) => T = <T extends object>(obj: T) => new Proxy<T>(obj, (new ReactiveObject()) as ProxyHandler<T>);
