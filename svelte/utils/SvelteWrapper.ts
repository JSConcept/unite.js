import {readable, type Readable} from "svelte/store";
import {subscribe} from "@ux-ts/reactive/ReactiveLib.ts";

//
export const wrapToStore = (reactive, prop: string = ""): Readable<any> => {
    return readable(reactive[prop], (set) => {
        subscribe(reactive, (v, _) => {
            set(v);
        }, prop);
    });
};
