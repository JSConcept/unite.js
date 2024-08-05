import stateMap from "./StateManager.ts";

//
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


//
export class Subscript {
    subscribers: Map<keyType, Set<(value: any, prop: keyType) => void>>;
    listeners: Set<(value: any, prop: keyType) => void>;

    //
    constructor(){
        this.subscribers = new Map();
        this.listeners = new Set();
    }

    //
    subscribe(cb: (value: any, prop: keyType) => void, prop: keyType | null) {
        if (prop) {
            if (this.subscribers.has(prop)) {
                this.subscribers.get(prop)?.add?.(cb);
            } else {
                this.subscribers.set(prop, new Set([cb]));
            }
        } else
        if (!this.listeners.has(cb)) {
            this.listeners.add?.(cb);
        }
    }

    //
    trigger(name, value = null) {
        Array.from(this.subscribers.get(name)?.values?.() || []).forEach((cb: (value: any, prop: keyType) => void) => cb(value, name));
        Array.from(this.listeners?.values?.() || []).forEach((cb: (value: any, prop: keyType) => void) => cb(value, name));
    }
}

//
const subscriptRegistry = new WeakMap<any, Subscript>();
export const extractSymbol = Symbol("@extract");

//
const register = (what: any, handle: any): any => {
    const unwrap = what?.[extractSymbol] ?? what;
    if (!subscriptRegistry.has(unwrap)) {
        subscriptRegistry.set(unwrap, new Subscript());
    }
    return handle;
}



//
export const subscribe = (target, cb: (value: any, prop: keyType) => void, prop: keyType | null = null, ctx: any | null = null)=>{
    const unwrap = target?.[extractSymbol] ?? target;

    //
    if (prop) {
        if (unwrap instanceof Map || unwrap instanceof WeakMap) {
            if (unwrap.has(prop as any) || !prop) {
                cb?.(unwrap.get(prop as any), prop);
            }
        } else

        //
        if (unwrap instanceof Set || unwrap instanceof WeakSet) {
            if (unwrap.has(prop as any) || !prop) {
                // @ts-ignore
                cb?.(unwrap.get(prop as any), prop);
            }
        } else

        //
        if (typeof unwrap == "function" || typeof unwrap == "object") {
            cb?.(Reflect.get(unwrap, prop, ctx ?? unwrap), prop);
        }
    };

    //
    const self = subscriptRegistry.get(unwrap);
    self?.subscribe?.(cb, prop);
    return self;
}

//
export class ReactiveMap {
    //
    constructor() {
    }

    //
    has(target, prop: keyType) {
        return Reflect.has(target, prop);
    }

    //
    get(target, name: keyType, ctx) {
        if (name == extractSymbol) {
            return target?.[extractSymbol] ?? target;
        }

        //
        const valueOrFx = bindCtx(target, Reflect.get(target, name, ctx));

        //
        if (name == "delete") {
            return (prop, _ = null) => {
                const result = valueOrFx(prop);
                subscriptRegistry.get(target)?.trigger?.(prop, null);
                return result;
            };
        }

        //
        if (name == "set") {
            return (prop, value) => {
                const result = valueOrFx(prop, value);
                subscriptRegistry.get(target)?.trigger?.(prop, value);
                return result;
            };
        }

        //
        return valueOrFx;
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
export class ReactiveSet {
    constructor() {
    }

    //
    has(target, prop: keyType) {
        return Reflect.has(target, prop);
    }

    //
    get(target, name: keyType, ctx) {
        //
        if (name == extractSymbol) {
            return target?.[extractSymbol] ?? target;
        }

        //
        const valueOrFx = bindCtx(target, Reflect.get(target, name, ctx));

        //
        if (name == "delete") {
            return (value) => {
                const result = valueOrFx(value);
                subscriptRegistry.get(target)?.trigger?.(value, null);
                return result;
            };
        }

        //
        if (name == "add") {
            return (value) => {
                const result = valueOrFx(value);
                subscriptRegistry.get(target)?.trigger?.(value, value);
                return result;
            };
        }

        //
        return valueOrFx;
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

///
export class ReactiveObject {
    constructor() {
    }

    //
    get(target, name: keyType, ctx) {
        if (name == extractSymbol) {
            return target?.[extractSymbol] ?? target;
        }
        return bindCtx(target, Reflect.get(target, name, ctx));
    }

    //
    construct(target, args, newT) {
        return Reflect.construct(target, args, newT);
    }

    //
    has(target, prop: keyType) {
        return Reflect.has(target, prop);
    }

    //
    apply(target, ctx, args) {
        return Reflect.apply(target, ctx, args);
    }

    //
    set(target, name: keyType, value) {
        const result = Reflect.set(target, name, value);
        const self = subscriptRegistry.get(target);
        self?.trigger?.(name, value);
        return result;
    }

    //
    deleteProperty(target, name: keyType) {
        const result = Reflect.deleteProperty(target, name);
        const self = subscriptRegistry.get(target);
        self?.trigger?.(name, null);
        return result;
    }
}

//
export const makeReactiveObject: <T extends object>(map: T) => T = <T extends object>(obj: T) => new Proxy<T>(obj?.[extractSymbol] ?? obj, register(obj, new ReactiveObject()) as ProxyHandler<T>);
export const makeReactiveMap: <K, V>(map: Map<K, V>) => Map<K, V> = <K, V>(map: Map<K, V>) => new Proxy(map?.[extractSymbol] ?? map, register(map, new ReactiveMap()) as ProxyHandler<Map<K, V>>);
export const makeReactiveSet: <V>(set: Set<V>) => Set<V> = <V>(set: Set<V>) => new Proxy(set?.[extractSymbol] ?? set, register(set, new ReactiveSet()) as ProxyHandler<Set<V>>);

//
export const createReactiveMap: <K, V>(map: [K, V][]) => Map<K, V> = <K, V>(map: [K, V][] = []) => new Proxy(new Map(map), register(map, new ReactiveMap()) as ProxyHandler<Map<K, V>>);
export const createReactiveSet: <V>(set: V[]) => Set<V> = <V>(set: V[] = []) => new Proxy(new Set(set), register(set, new ReactiveSet()) as ProxyHandler<Set<V>>);

//stateMap
export const makeReactive: any = (target: any, stateName = ""): any => {
    const unwrap = target?.[extractSymbol] ?? target; let reactive = target;

    //
    if (unwrap instanceof Map || unwrap instanceof WeakMap) {
        reactive = makeReactiveMap(target);
    } else

    //
    if (unwrap instanceof Set || unwrap instanceof WeakSet) {
        reactive = makeReactiveSet(target);
    } else

    //
    if (typeof unwrap == "function" || typeof unwrap == "object") {
        reactive = makeReactiveObject(target);
    }

    //
    if (stateName) stateMap.set(stateName, reactive);

    //
    return reactive;
}

//
export const createReactive: any = (target: any, stateName = ""): any => {
    const unwrap = target?.[extractSymbol] ?? target; let reactive = target;

    // BROKEN!
    if (Array.isArray(target)) {
        //reactive = createReactiveMap(target);
        //reactive = createReactiveSet(target);
    } else

    //
    if (typeof unwrap == "function" || typeof unwrap == "object") {
        reactive = makeReactiveObject(target);
    }

    //
    if (stateName) stateMap.set(stateName, reactive);

    //
    return reactive;
}