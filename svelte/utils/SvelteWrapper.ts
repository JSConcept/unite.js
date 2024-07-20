import {readable, type Readable} from "svelte/store";

//
export const wrapToStore = (reactive, prop: string = ""): Readable<any> => {
    return readable(reactive[prop], (set) => {
        reactive?.["@subscribe"]?.((v, _) => {
            set(v);
        }, prop);
    });
};
