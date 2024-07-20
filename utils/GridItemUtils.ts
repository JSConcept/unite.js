//import {get} from "node:http";
import {makeReactiveObject} from "../reactive/ReactiveObject.ts";
import {getCorrectOrientation, isMobile} from "./Utils.ts";

//
export interface GridItemType {
    cell: [number, number];
    id: string;
    label: string;
    pointerId: number;
    icon: string;
    href?: string;
    action?: string;
    detached?: boolean;
};

//
export interface GridPageType {
    id: string;
    list: string[];
    layout: [number, number];
    size: [number, number];
};

//
export interface GridArgsType {
    item: GridItemType;
    items: Map<string, GridItemType>;
    page: GridPageType;
};

//
export interface GridsStateType {
    grids: Map<string, GridPageType>;
    items: Map<string, GridItemType>;
    lists: Map<string, Set<string>>;
};


//
export const getParent = (e) => {
    const parent = e.parentNode || e.parentElement || e?.getRootNode?.()?.host;
    return parent.shadowRoot && e.slot != null
        ? parent.shadowRoot.querySelector(
            e.slot ? `slot[name=\"${e.slot}\"]` : `slot:not([name])`
        ).parentNode
        : parent;
};

//
export const redirectCell = (gridArgs: GridArgsType, $preCell: [number, number]) => {
    //const items = gridItems;
    const preCell: [number, number] = [...$preCell]; // make non-conflict copy
    const icons =
        [...gridArgs.page.list]?.map((id) => gridArgs.items.get(id)).filter((m) => !!m) || [];

    //
    const checkBusy = (cell) => {
        return icons
            .filter((e) => e != gridArgs.item && e.id != gridArgs.item.id && (e.pointerId < 0 || e.pointerId == null))
            .find((one) => {
                return one.cell[0] == cell[0] && one.cell[1] == cell[1];
            });
    };

    //
    if (!checkBusy(preCell)) {
        gridArgs.item.cell = makeReactiveObject([...preCell]);
        return gridArgs.item.cell;
    }

    //
    const orientation = getCorrectOrientation();
    const layout = [...gridArgs.page.layout];
    if (orientation.startsWith("landscape")) {
        //layout.reverse();
    }

    //
    const columns = layout[0] || 4;
    const rows = layout[1] || 8;

    //
    const variants: [number, number][] = [
        [preCell[0] + 1, preCell[1]] as [number, number],
        [preCell[0] - 1, preCell[1]] as [number, number],
        [preCell[0], preCell[1] + 1] as [number, number],
        [preCell[0], preCell[1] - 1] as [number, number],
    ].filter((v) => {
        return v[0] >= 0 && v[0] < columns && v[1] >= 0 && v[1] < rows;
    }) || [];

    //
    const suitable = variants.find((v) => !checkBusy(v));
    if (suitable) {
        gridArgs.item.cell = makeReactiveObject([...suitable]);
        return gridArgs.item.cell;
    }

    //
    let exceed = 0;
    let busy = checkBusy(preCell);
    while (busy && exceed++ < columns * rows) {
        if (!busy) {
            gridArgs.item.cell = makeReactiveObject([...preCell]);
            return gridArgs.item.cell;
        }

        //
        preCell[0]++;
        if (preCell[0] >= columns) {
            preCell[0] = 0;
            preCell[1]++;

            //
            if (preCell[1] >= rows) {
                preCell[1] = 0;
            }
        }

        //
        busy = checkBusy(preCell);
    }

    //
    gridArgs.item.cell = makeReactiveObject(preCell);
    return gridArgs.item.cell;
};

//
export const putToCell = (gridArgs: GridArgsType, $coord: [number, number]) => {
    // should be relative from grid-box (not absolute or fixed position)
    const last: [number, number] = [...$coord];

    //
    const orientation = getCorrectOrientation();
    const oxBox = [...gridArgs.page.size];

    //
    //if (orientation.startsWith("landscape")) oxBox.toReversed();

    //
    const layout = [...gridArgs.page.layout];
    if (orientation.startsWith("landscape")) {
        //layout.reverse();
        oxBox.reverse();
    }

    //
    const inBox = [oxBox[0] / layout[0], oxBox[1] / layout[1]];
    let preCell: [number, number] = [...gridArgs.item.cell];

    //
    switch (orientation) {
        case "portrait-primary":
            preCell = [
                Math.floor(last[0] / inBox[0]) || 0,
                Math.floor(last[1] / inBox[1]) || 0
            ];
            break;
        case "landscape-primary":
            preCell = [
                Math.floor((oxBox[0] - last[1]) / inBox[0]) || 0,
                Math.floor(last[0] / inBox[1]) || 0
            ];
            break;
        case "portrait-secondary":
            preCell = [
                Math.floor((oxBox[0] - last[0]) / inBox[0]) || 0,
                Math.floor((oxBox[1] - last[1]) / inBox[1]) || 0
            ];
            break;
        case "landscape-secondary":
            preCell = [
                Math.floor(last[1] / inBox[0]) || 0,
                Math.floor((oxBox[1] - last[0]) / inBox[1]) || 0
            ];
            break;
    }

    //
    return redirectCell(
        gridArgs,
        preCell
    );
};
