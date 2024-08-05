
//
type keyType = string | number | symbol;

//
const bindCtx = (target, fx) => {
    return (typeof fx == "function" ? fx?.bind?.(target) : fx) ?? fx;
};

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
        const exists = target[name];
        let entries: any = null;//(value instanceof Map || value instanceof Set || Array.isArray(value)) ? value.entries() : Object.entries(value);

        //
        if (value instanceof Set) entries = value.values();
        if (value instanceof Map) entries = value.entries();
        if (Array.isArray(value)) entries = value.entries();

        //
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

        //
        const result = Reflect.set(target, name, value);
        return result;
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
