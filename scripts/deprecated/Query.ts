// AX Query - DEPRECATED Due Outdated Mechanics
// Used by first edition of IDC-LX, and will no more used...
// Needs to rewriting! Planned to rewrite at end of 2024 years.


//
import Timer from "../performance/Time.ts";
import {zoomOf} from "../utils/Utils.ts";

//
export class DynamicHandler {
    index: number = 0;
    query: string = "";

    //
    constructor(query = "", index = 0) {
        this.index = index;
        this.query = query;
    }

    //
    get(target, name, ctx) {
        const array = Array.from(target.querySelectorAll(this.query) ?? []);

        //
        if (Number.isInteger(name)) {
            return array[(this.index ?? 0) + parseInt(name)];
        }

        //
        if (name == "length") {
            return array.length - (this.index ?? 0);
        }

        //
        if (array[name] != null) {
            return typeof array[name] == "function" ||
                array[name] instanceof Function
                ? array[name].bind(array)
                : array[name];
        }

        //
        const _f = (array[this.index || 0] as HTMLElement)[name];
        return typeof _f == "function" || _f instanceof Function
            ? _f.bind(ctx)
            : _f;
    }

    //
    set(target, name, value) {
        const array = Array.from(target.querySelectorAll(this.query) ?? []);

        //
        if (Number.isInteger(name)) {
            //return (array[this.index + name] = value) != null;
            return false;
        }

        //
        if (
            array[name] !=
            null /*&& (typeof array[name] == 'function' || array[name] instanceof Function)*/
        ) {
            return false;
        }

        //
        return ((array[this.index || 0] as HTMLElement)[name] = value) != null;
    }
}

//
const _changed_ = Symbol("changed");
const _observed_ = Symbol("bound");

//
type EventSequence = [name: string, cb: Function, params?: Object];

//
export default class AxQuery {
    //#nodeObserver: MutationObserver | null = null;
    #attributeObserver: MutationObserver | null = null;
    #attribListener = new Map<String, Set<Function>>([]);
    #eventListener = new WeakMap<HTMLElement, Set<EventSequence>>([]);
    #domListener = new Map<string, Set<Function>>([]);
    #muted = false;

    //
    ROOT: HTMLElement = document.documentElement;

    //
    #mutedAction(action) {
        this.#muted = true;
        const r = action?.();
        this.#muted = false;
        return r;
    }

    //
    #mutFn(fn) {
        return (...args) => {
            return this.#mutedAction(() => fn(...args));
        };
    }

    //
    constructor(ROOT: HTMLElement = document.documentElement) {
        const attribListener = new Map<string, Set<Function>>([]);
        const eventListener = new WeakMap<HTMLElement, Set<EventSequence>>([]);
        const domListener = new Map<string, Set<Function>>([]);

        //
        const attributeObserver =
            typeof MutationObserver != "undefined"
                ? new MutationObserver(async (mutationList, _) => {
                    if (!this.#muted) {
                        mutationList.forEach(async (mut) => {
                            const allowed = ["style"].indexOf(mut.attributeName || "") < 0;
                            const value = (mut.target as HTMLElement)?.getAttribute?.(mut.attributeName || "");
                            if (
                                !mut?.attributeName?.startsWith("aq-") &&
                                value != mut?.oldValue &&
                                !mut.target[_changed_]
                            ) {
                                for (const [selector, fns] of attribListener.entries()) {
                                    if (
                                        allowed &&
                                        (mut.target as HTMLElement)?.matches?.(selector || "")
                                    ) {
                                        Array.from(fns.values()).forEach((F) =>
                                            F(
                                                [mut.target],
                                                selector,
                                                mut.attributeName
                                            )
                                        );
                                    }
                                }
                            }
                        });
                    }
                })
                : null;

        //
        const nodeObserver =
            typeof MutationObserver != "undefined"
                ? new MutationObserver(async (mutationList, _) => {
                    if (!this.#muted) {
                        for (const [selector, fns] of domListener.entries()) {
                            mutationList.forEach(async (mut) => {
                                const target = mut?.target as HTMLElement;

                                //
                                let elements =
                                    (mut.addedNodes as unknown as HTMLElement[])?.filter((e) => {
                                        //return elements.indexOf(e) > -1;
                                        return e.matches(selector);
                                    }) || [];

                                //
                                if (
                                    target?.matches(selector) &&
                                    elements.indexOf(target as HTMLElement) < 0
                                ) {
                                    elements.push(target as HTMLElement);
                                }

                                //
                                elements = [...new Set(elements)];
                                Array.from(fns.values()).forEach((F) => F(elements, selector));
                            });
                        }
                    }
                })
                : null;

        //
        nodeObserver?.observe?.((this.ROOT = ROOT), {
            childList: true,
            subtree: true,
        });

        //
        this.defer.then(() => {
            for (const [selector, fns] of domListener.entries()) {
                Array.from(fns.values()).forEach((F) =>
                    F(
                        this.dynamic(selector).filter((el) => !el[_changed_]),
                        selector
                    )
                );
            }
        });

        // @ts-ignore
        this.#nodeObserver = nodeObserver;

        // @ts-ignore
        this.#attributeObserver = attributeObserver;

        //
        this.#attribListener = attribListener;
        this.#eventListener = eventListener;
        this.#domListener = domListener;
    }

    //
    #reflectAttribInStyle(selector, elements, attribs) {
        for (const [key, unit] of attribs.entries()) {
            elements.forEach(async (e, I) => {
                if (!e[_changed_] && e != null) {
                    //await Timer.raf;
                    const K = await (typeof key == "function"
                        ? key(e, I)
                        : key);
                    const k = `${K}`; //(K.startsWith("aq-") ? `--${K}` : `--aq-${K}`);
                    const v =
                        typeof unit == "function"
                            ? await unit?.(e?.getAttribute?.(K), e)
                            : `${e?.getAttribute?.(K)}${unit ?? ""}`;

                    //
                    e[_changed_] = true;
                    if (e.matches(selector)) {
                        const val = e.style.getPropertyValue(k) == null;
                        if (val != v || val == null) {
                            e.style.setProperty(k, v, "");
                        }
                    } else {
                        e.style.removeProperty(k);
                    }
                    delete e[_changed_];
                }
            });
        }
    }

    //
    #applyEvents(selector, elements, args) {
        elements.forEach(async (e, _) => {
            //
            const mb = e?.matches?.(selector);

            //
            let list = (this.#eventListener.has(e)
                ? this.#eventListener.get(e)
                : new Set([])) || new Set([]);

            //
            if (mb && !list.has(args)) {
                if (!this.#eventListener.has(e)) {
                    this.#eventListener.set(e, list);
                }

                //
                if (!list.has(args)) {
                    list.add(args);
                    e?.addEventListener?.(...args);
                }
            } else {
                list.delete(args);
                e?.removeEventListener?.(...args);
            }
        });
    }

    //
    async #listenAttributes(e/*, selector, mutation*/) {
        //
        if (!e[_observed_]) {
            //await Timer.raf;
            e[_changed_] = true;
            e[_observed_] = true;
            this.#attributeObserver?.observe?.(e, {attributes: true});
            delete e[_changed_];
        }
    }

    //
    #observeAttrib(selector, elements, attribs, mutation) {
        for (const [key, value] of attribs.entries()) {
            elements.forEach(async (e, I) => {
                if (!e[_changed_] && e.matches(selector)) {
                    if (
                        ["style", "class", "id"].indexOf(mutation ?? key) < 0 &&
                        (mutation ? key == mutation : true) &&
                        !key.startsWith("aq-")
                    ) {
                        //await Timer.raf;
                        e[_changed_] = true;
                        await value(e, I);
                        delete e[_changed_];
                    }
                    //this.#listenAttributes(e, selector);
                }
            });
        }
    }

    //
    #applyAttrib(selector, elements, attribs, mutation) {
        for (const [key, value] of attribs.entries()) {
            elements.forEach(async (e, I) => {
                if (!e[_changed_] && e.matches(selector)) {
                    if (
                        (["style", "class", "id"].indexOf(mutation) >= 0
                            ? key != mutation
                            : mutation
                                ? key == mutation
                                : true) &&
                        !key.startsWith("aq-")
                    ) {
                        //await Timer.raf;
                        e[_changed_] = true;
                        const val = await (typeof value == "function"
                            ? value(e, I)
                            : value);
                        const attr = e.getAttribute(key);
                        if (attr != val || attr == null) {
                            e.setAttribute(key, val);
                        }
                        delete e[_changed_];
                    }
                }
            });
        }
    }

    //
    $domListen(selector, fn_) {
        const fn = this.#mutFn(async (els, ...args) => {
            return fn_(
                els.filter((el) => !el[_changed_] && el.matches(selector)),
                ...args
            );
        });

        //
        if (!this.#domListener.has(selector)) {
            this.#domListener.set(selector, new Set([fn]));
        } else {
            this.#domListener.get(selector)?.add?.(fn);
        }

        //
        return fn(this.dynamic(selector), selector);
    }

    //
    $attribListen(selector, fn_) {
        const fn = this.#mutFn(async (els, ...args) => {
            return fn_(
                els.filter((el) => !el[_changed_] && el.matches(selector)),
                ...args
            );
        });

        //
        if (!this.#attribListener.has(selector)) {
            this.$domListen(selector, (els) =>
                els.map((el) => this.#listenAttributes(el/*, selector, null*/))
            );
            this.#attribListener.set(selector, new Set([fn]));
        } else {
            this.#attribListener.get(selector)?.add?.(fn);
        }

        //
        return fn(this.dynamic(selector), selector);
    }

    //
    once(selector, fn/*, muted = true*/) {
        return this.#mutedAction(() => {
            return this.dynamic(selector).map(fn);
        });
    }

    // new events type, based on bubble and delegation
    // bindings to root element, not on every selected elements
    delegated(selector, args) {
        const dynamic = this.dynamic(selector);
        this.ROOT.addEventListener(
            args[0],
            async (e) => {
                //await Timer.raf;
                if (
                    e?.target?.matches?.(selector) &&
                    dynamic.indexOf(e.target) >= 0
                ) {
                    args[1](e);
                }
            },
            {
                ...(args?.[2] ?? {}),
                capture: args?.[2]?.capture ?? false,
                once: args?.[2]?.once ?? false,
                passive: args?.[2]?.passive ?? false,
            }
        );
        return dynamic;
    }

    // more agressive events type, based on capture or delegation
    // bindings to root element, not on every selected elements
    propagated(selector, args) {
        const dynamic = this.dynamic(selector);
        this.ROOT.addEventListener(
            args[0],
            async ($e) => {
                const e =
                    $e.clientX == null && $e.clientY == null && $e.detail
                        ? $e.detail
                        : $e;
                e.stopPropagation();
                let target = document?.elementFromPoint?.(
                    e.clientX,
                    e.clientY
                );
                if (target != null) {
                    if (
                        target.matches(selector) &&
                        dynamic.indexOf(target) >= 0
                    ) {
                        await args[1]($e, target);
                    }

                    // try on parent nodes
                    else if (
                        (target = target.closest(selector)) != null &&
                        !args?.[2]?.targetOnly
                    ) {
                        if (
                            target.matches(selector) &&
                            dynamic.indexOf(target) >= 0 &&
                            Array.from(
                                document?.elementsFromPoint?.(
                                    e.clientX,
                                    e.clientY
                                )
                            ).indexOf(target) >= 0
                        ) {
                            await args[1]($e, target);
                        }
                    }
                }
            },
            {
                ...(args?.[2] ?? {}),
                capture: args?.[2]?.capture ?? true,
                once: args?.[2]?.once ?? false,
                passive: args?.[2]?.passive ?? false,
            }
        );
        return dynamic;
    }

    //
    per(s, fn) {
        return this.$domListen(s, (e, sel = s, m) =>
            this.#mutFn(
                e.map(async (el) => {
                    if (
                        el.matches(sel) &&
                        (m == null || ["id", "class"].indexOf(m) >= 0) &&
                        !el[_changed_]
                    ) {
                        await Timer.raf;
                        el[_changed_] = true;
                        const chg = await fn(el, sel, m);
                        delete el[_changed_];
                        return chg;
                    }
                    return null;
                })
            )
        );
    }

    //
    observe(s, attributes) {
        return this.$attribListen(
            s,
            (elements, selector = s, mutation = null) => {
                // pre-set attributes
                return this.#observeAttrib(
                    selector ?? s,
                    elements,
                    attributes instanceof Map
                        ? attributes
                        : new Map(attributes),
                    mutation
                );
            }
        );
    }

    //
    sheet(s, attributes) {
        return this.$attribListen(
            s,
            (elements, selector = s, mutation = null) => {
                // pre-set attributes
                return this.#applyAttrib(
                    selector ?? s,
                    elements,
                    attributes instanceof Map
                        ? attributes
                        : new Map(attributes),
                    mutation
                );
            }
        );
    }

    //
    event(s, args) {
        return this.$attribListen(
            s,
            (elements, selector = s, _) => {
                // pre-set attributes
                return this.#applyEvents(selector ?? s, elements, args);
            }
        );
    }

    //
    attribCSS(s, attributes) {
        return this.$attribListen(
            s,
            (elements, selector = s, _) => {
                return this.#reflectAttribInStyle(
                    selector ?? s,
                    elements,
                    attributes
                );
            }
        );
    }

    //
    get defer() {
        const resolveOf = async (x) => {
            if (
                ["loading", "interactive", "complete"].indexOf(
                    document.readyState
                ) >= 1
            ) {
                await Timer.raf;
                x({});
                return true;
            }
            return false;
        };
        return new Promise(async (x) => {
            if (!(await resolveOf(x))) {
                document.documentElement.addEventListener(
                    "readystatechange",
                    (_) => resolveOf(x),
                    {once: false, passive: true}
                );
            }
        });
    }

    //
    dynamic(s, i = 0) {
        return new Proxy(this.ROOT, new DynamicHandler(s, i));
    }
}

//
export const AQDefault = new AxQuery();
