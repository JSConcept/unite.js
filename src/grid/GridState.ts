import * as JSOX from 'jsox';

//
import {createReactiveMap} from "reactive/ReactiveMap";
import {makeReactiveObject} from "reactive/ReactiveObject";
import {makeReactiveSet} from "reactive/ReactiveSet";
import type {GridItem, GridPage} from "./GridItemUtils.ts";

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
export const gridsState: Map<string, GridPage> = toMap(JSOX.parse(localStorage.getItem("@gridsState") || "[]"));
export const itemsState: Map<string, GridItem> = toMap(JSOX.parse(localStorage.getItem("@itemsState") || "[]"));
export const gridsLists: Map<string, Set<string>> = toMapSet(Array.from(gridsState.values()).map((gs) => [gs.id, gs.list]));

//
gridsLists?.["@subscribe"]?.((v, prop) => {
    const changed = gridsState.get(prop);
    if (changed) {changed.list = v;}
});
