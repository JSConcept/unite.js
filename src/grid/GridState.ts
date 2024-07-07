import * as JSOX from 'jsox';

//
import {createReactiveMap} from "reactive/ReactiveMap";
import {makeReactiveObject} from "reactive/ReactiveObject";
import {makeReactiveSet} from "reactive/ReactiveSet";
import {GridItemType, GridPageType} from "./GridItemUtils.ts";

//
export const toMapSet = <K, V>(list) => {
    return createReactiveMap<K, V>(list.map(([id, list]) => [id, makeReactiveSet(list)]));
};

//
export const toMap = <K, V>(list) => {
    return createReactiveMap<K, V>(list.map((obj) => [obj.id, makeReactiveObject(obj)]));
};

//
export const fromMap = <K, V>(map: Map<K, V>): V[] => {
    return Array.from(map.values());
};

//
export const state: {
    grids: Map<string, GridPageType>;
    items: Map<string, GridItemType>;
    lists: Map<string, Set<string>>;
} = makeReactiveObject({
    grids: toMap(JSOX.parse(localStorage.getItem("@gridsState") || "[]")),
    items: toMap(JSOX.parse(localStorage.getItem("@itemsState") || "[]")),
    lists: new Map<string, Set<string>>()
});

//
state.lists = toMapSet(Array.from(state.grids.values()).map((gs) => [gs.id, gs.list]));

//
state.lists?.["@subscribe"]?.((v, prop) => {
    const changed = state.grids.get(prop);
    if (changed) {changed.list = v;}
});

//
state.grids?.["@subscribe"]?.(() => {
    localStorage.setItem("@gridsState", JSOX.stringify(Array.from(state.grids.values())));
});

//
state.items?.["@subscribe"]?.(() => {
    localStorage.setItem("@itemsState", JSOX.stringify(Array.from(state.items.values())));
});

//
state?.["@subscribe"]?.(() => {
    localStorage.setItem("@gridsState", JSOX.stringify(Array.from(state.grids.values())));
    localStorage.setItem("@itemsState", JSOX.stringify(Array.from(state.items.values())));
});
