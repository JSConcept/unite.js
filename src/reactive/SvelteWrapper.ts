import {readable} from "svelte/store";

//
export const wrapToStore = (reactive, prop: string = "") => {
    return readable(reactive[prop], (set) => {
        reactive?.["@subscribe"]?.((v, _) => {
            set(v);
        }, prop);
    });
};
