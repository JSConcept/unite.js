const boundCtx = new WeakMap();
const bindFx = (target, fx)=>{
    if (!boundCtx.has(target)) {
        boundCtx.set(target, new WeakMap());
    }

    //
    const be = boundCtx.get(target);
    if (!be.has(fx)) {
        const bfx = fx?.bind?.(target);
        be.set(fx, bfx);
    }

    //
    return be.get(fx);
}

//
const bindCtx = (target, fx) => {
    return (typeof fx == "function" ? bindFx(target, fx) : fx) ?? fx;
}

//
type keyType = string | number | symbol;

///
export default class ReactiveObject {
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
    get(target, name: keyType, ctx) {
        if (name == "@subscribe") {
            return (cb: (value: any, prop: keyType) => void, prop: keyType) => {
                if (prop) {cb?.(Reflect.get(target, prop, ctx), prop);};
                this["@subscribe"](cb, prop);
            };
        }
        if (name == "@extract") {
            return target;
        }
        return bindCtx(target, Reflect.get(target, name, ctx));
    }

    //
    construct(target, args, newT) {
        return Reflect.construct(target, args, newT);
    }

    //
    has(target, prop: keyType) {
        if (prop == "@subscribe") {return false;};
        if (prop == "@extract") {return false;};
        return Reflect.has(target, prop);
    }

    //
    apply(target, ctx, args) {
        return Reflect.apply(target, ctx, args);
    }

    //
    set(target, name: keyType, value) {
        const result = Reflect.set(target, name, value);
        Array.from(this.subscribers.get(name)?.values?.() || []).forEach((cb: (value: any, prop: keyType) => void) => cb(value, name));
        Array.from(this.listeners?.values?.() || []).forEach((cb: (value: any, prop: keyType) => void) => cb(value, name));
        return result;
    }

    //
    deleteProperty(target, name: keyType) {
        const result = Reflect.deleteProperty(target, name);
        Array.from(this.subscribers.get(name)?.values?.() || []).forEach((cb: (value: any, prop: keyType) => void) => cb(null, name));
        Array.from(this.listeners?.values?.() || []).forEach((cb: (value: any, prop: keyType) => void) => cb(null, name));
        return result;
    }
}

//
export const makeReactiveObject: <T extends object>(map: T) => T = <T extends object>(obj: T) => new Proxy<T>(obj, (new ReactiveObject()) as ProxyHandler<T>);
