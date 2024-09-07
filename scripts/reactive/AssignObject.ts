//
type keyType = string | number | symbol;

//
const isIterable = (obj) => {
    return (typeof obj?.[Symbol.iterator] == "function");
}




//
export const removeExtra = (target, value, name: keyType | null = null)=>{
    const exists = name != null && (typeof target == "object" || typeof target == "function") ? (target?.[name] ?? target) : target;

    //
    let entries: any = [];
    if (value instanceof Set || value instanceof Map || Array.isArray(value) || isIterable(value)) {
        entries = ((exists instanceof Set || exists instanceof WeakSet) ? value?.values?.() : value?.entries?.()) || value;
    } else
    if (typeof value == "object" || typeof value == "function") {
        entries = (exists instanceof Set || exists instanceof WeakSet) ? Object.values(value) : Object.entries(value);
    }

    //
    let exEntries: any = [];
    if (Array.isArray(exists)) {
        exEntries = exists.entries();
    } else
    if (exists instanceof Map || exists instanceof WeakMap) {
        exEntries = exists?.entries?.();
    } else
    if (exists instanceof Set || exists instanceof WeakSet) {
        exEntries = exists?.values?.();
    } else
    if (typeof exists == "object" || typeof exists == "function") {
        exEntries = Object.entries(exists);
    }

    //
    const keys = new Set(Array.from(entries).map((e)=>e?.[0]));
    const exe  = new Set(Array.from(exEntries).map((e)=>e?.[0]));

    // REQUIRES NEW ECMASCRIPT!!!
    const exclude = exe?.difference?.(keys);

    //
    if (Array.isArray(exists)) {
        const nw = exists.filter((_,I)=>!exclude.has(I));
        exists.splice(0, exists.length);
        exists.push(...nw);
    } else
    if (exists instanceof Map || exists instanceof WeakMap) {
        for (const k of exclude) { exists.delete(k); };
    } else
    if (exists instanceof Set || exists instanceof WeakSet) {
        for (const k of exclude) { exists.delete(k); };
    } else
    if (typeof exists == "function" || typeof exists == "object") {
        for (const k of exclude) { delete exists[k]; };
    }

    //
    return exists;
}

//
export const objectAssign = (target, value, name: keyType | null = null, removeNotExists = false)=>{
    const exists = name != null && (typeof target == "object" || typeof target == "function") ? (target?.[name] ?? target) : target;
    let entries: any = null;

    //
    if (removeNotExists) { removeExtra(exists, value); }

    //
    if (value instanceof Set || value instanceof Map || Array.isArray(value) || isIterable(value)) {
        entries = ((exists instanceof Set || exists instanceof WeakSet) ? value?.values?.() : value?.entries?.()) || value;
    } else
    if (typeof value == "object" || typeof value == "function") {
        entries = (exists instanceof Set || exists instanceof WeakSet) ? Object.values(value) : Object.entries(value);
    }

    //
    if (exists && entries) {
        if (Array.isArray(exists)) {
            for (const [k,v] of entries) {
                exists[k] = v;
            }
            return true;
        }

        //
        if (exists instanceof Map || exists instanceof WeakMap) {
            for (const E of entries) {
                // @ts-ignore
                exists.set(...E);
            }
            return true;
        }

        //
        if (exists instanceof Set || exists instanceof WeakSet) {
            for (const E of entries) {
                // @ts-ignore
                exists.add(...E);
            }
            return true;
        }

        //
        if (typeof exists == "object" || typeof exists == "function") {
            return Object.assign(exists, Object.fromEntries(entries));
        }
    }

    //
    if (name != null) {
        return Reflect.set(target, name, value);
    } else
    if (typeof value == "object" || typeof value == "function") {
        return Object.assign(target, value);
    }
}

//
export class AssignObjectHandler {
    //
    constructor() {
    }

    //
    get(target, name: keyType, ctx) {
        return Reflect.get(target, name, ctx);
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
        return objectAssign(target, value, name);
    }

    //
    deleteProperty(target, name: keyType) {
        const result = Reflect.deleteProperty(target, name);
        return result;
    }
}

//
export const makeObjectAssignable = (obj) => {
    // @ts-ignore
    return new Proxy(obj, new AssignObjectHandler());
};
