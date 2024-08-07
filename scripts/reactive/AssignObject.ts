
//
type keyType = string | number | symbol;

//
const isIterable = (obj) => {
    return (typeof obj?.[Symbol.iterator] == "function");
}

//
export const objectAssign = (target, name: keyType, value)=>{
    const exists = target[name];
    let entries: any = null;

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
    return Reflect.set(target, name, value);
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
        return objectAssign(target, name, value);
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
