import {subscribe} from "./ReactiveLib.ts";

//
export class StateManager {
    elements = new WeakMap<HTMLElement, any>();
    named = new Map<string, any>();

    //
    constructor() {
    }

    //
    setState(name: string, state: any, whatToDo: Function | null = null) {
        this.named.set(name, state);
        whatToDo?.(name, state);
        return this;
    }

    //
    bindState(element: HTMLElement, state: any, whatToDo: Function | null = null) {
        this.elements.set(element, state);
        whatToDo?.(element, state);
        return this;
    }

    //
    getState(element: HTMLElement) {
        return element instanceof HTMLElement ? this.elements.get(element) : this.named.get(element);
    }

    //
    stateBehave(element: HTMLElement | string, onChange: Function | null = null) {
        // @ts-ignore
        const state = (element instanceof HTMLElement ? this.elements : this.named).get(element);

        //
        if (element instanceof HTMLElement) {
            const ref = new WeakRef(element);
            subscribe(state, (value, prop)=>{
                onChange?.(ref.deref(), prop, value);
            });
        } else {
            subscribe(state, (value, prop)=>{
                onChange?.(element, prop, value);
            });
        }

        //
        return this;
    }
}

//
const states = new StateManager();

//
export default states;
