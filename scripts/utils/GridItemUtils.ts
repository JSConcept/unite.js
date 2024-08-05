//import {get} from "node:http";
import {makeReactive} from "../reactive/ReactiveLib.ts";
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
export const redirectCell = ($preCell: [number, number], gridArgs: GridArgsType) => {
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
        gridArgs.item.cell = makeReactive([...preCell]);
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
        gridArgs.item.cell = makeReactive([...suitable]);
        return gridArgs.item.cell;
    }

    //
    let exceed = 0;
    let busy = checkBusy(preCell);
    while (busy && exceed++ < columns * rows) {
        if (!busy) {
            gridArgs.item.cell = makeReactive([...preCell]);
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
    gridArgs.item.cell = makeReactive(preCell);
    return gridArgs.item.cell;
};




/*
 * NEXT GENERATION!
 */


//
const orientationNumberMap = {
    "portrait-primary": 0,
    "landscape-primary": 1,
    "portrait-secondary": 2,
    "landscape-secondary": 3
}

//
const roundNearest = (number, N = 1)=>(Math.round(number * N) / N)

//
export const convertPointerPxToOrientPx = ($pointerPx: [number, number], gridArgs: GridArgsType)=>{
    const orientation = getCorrectOrientation();
    const boxInPx = [...gridArgs.page.size];
    const pointerPx: [number, number] = [...$pointerPx];
    const orientIndex = orientationNumberMap[orientation] || 0;

    //
    if (orientIndex%2) { boxInPx.reverse(); pointerPx.reverse(); }
    return [
        ((orientIndex==0 || orientIndex==3) ? pointerPx[0] : boxInPx[0] - pointerPx[0]) || 0,
        ((orientIndex==0 || orientIndex==1) ? pointerPx[1] : boxInPx[1] - pointerPx[1]) || 0
    ];
}

//
export const convertOrientPxToPointerPx = ($orientPx: [number, number], gridArgs: GridArgsType)=>{
    const orientation = getCorrectOrientation();
    const boxInPx = [...gridArgs.page.size];
    const orientPx: [number, number] = [...$orientPx];
    const orientIndex = orientationNumberMap[orientation] || 0;

    //
    if (orientIndex%2) { boxInPx.reverse(); }
    const pointerPx = [
        ((orientIndex==0 || orientIndex==3) ? orientPx[0] : boxInPx[0] - orientPx[0]) || 0,
        ((orientIndex==0 || orientIndex==1) ? orientPx[1] : boxInPx[1] - orientPx[1]) || 0
    ];
    if (orientIndex%2) { pointerPx.reverse(); }
    return pointerPx;
}


//
export const convertOrientPxToCX = ($orientPx: [number, number], gridArgs: GridArgsType)=>{
    const orientation = getCorrectOrientation();
    const boxInPx = [...gridArgs.page.size];
    const orientPx: [number, number] = [...$orientPx];
    const orientIndex = orientationNumberMap[orientation] || 0;
    const layout = [...gridArgs.page.layout];
    if (orientIndex%2) { boxInPx.reverse(); };

    //
    const gridPxToCX = [layout[0] / boxInPx[0], layout[1] / boxInPx[1]];
    return [orientPx[0] * gridPxToCX[0], orientPx[1] * gridPxToCX[1]]
}



//
export const relativeToAbsoluteInPx = ($relativePx: [number, number], gridArgs: GridArgsType)=>{
    const orientation = getCorrectOrientation();
    const boxInPx = [...gridArgs.page.size];
    const orientIndex = orientationNumberMap[orientation] || 0;
    const layout = [...gridArgs.page.layout];
    if (orientIndex%2) { boxInPx.reverse(); };

    //
    const gridCXToPx = [boxInPx[0] / layout[0], boxInPx[1] / layout[1]];
    const $orientPxBasis: [number, number] = [
        gridArgs.item.cell[0] * gridCXToPx[0],
        gridArgs.item.cell[1] * gridCXToPx[1]
    ];
    const pointerPxBasis = convertOrientPxToPointerPx($orientPxBasis, gridArgs);
    return [pointerPxBasis[0] + $relativePx[0], pointerPxBasis[1] + $relativePx[1]];
}



//
export const absoluteCXToRelativeCX = ($CX: [number, number], gridArgs: GridArgsType)=>{
    const $orientPxBasis = [gridArgs.item.cell[0], gridArgs.item.cell[1]];
    return [$CX[0] - $orientPxBasis[0], $CX[1] - $orientPxBasis[1]];
}



//
export const absolutePxToRelativeInOrientPx = ($absolutePx: [number, number], gridArgs: GridArgsType)=>{
    const orientation = getCorrectOrientation();
    const boxInPx = [...gridArgs.page.size];
    const orientIndex = orientationNumberMap[orientation] || 0;
    const layout = [...gridArgs.page.layout];
    if (orientIndex%2) { boxInPx.reverse(); };

    //
    const gridCXToPx = [boxInPx[0] / layout[0], boxInPx[1] / layout[1]];
    const $orientPxBasis = [gridArgs.item.cell[0] * gridCXToPx[0], gridArgs.item.cell[1] * gridCXToPx[1]];
    const orientPx = convertPointerPxToOrientPx($absolutePx, gridArgs);
    return [orientPx[0] - $orientPxBasis[0], orientPx[1] - $orientPxBasis[1]];
}

// should be relative from grid-box (not absolute or fixed position)
export const floorInOrientPx = ($orientPx: [number, number], gridArgs: GridArgsType) => {
    const orientPx: [number, number] = [...$orientPx];
    const orientation = getCorrectOrientation();
    const boxInPx = [...gridArgs.page.size];
    const orientIndex = orientationNumberMap[orientation] || 0;
    const layout = [...gridArgs.page.layout];
    if (orientIndex%2) { boxInPx.reverse(); };

    //
    const inBox = [boxInPx[0] / layout[0], boxInPx[1] / layout[1]];
    return [roundNearest(orientPx[0], inBox[0]), roundNearest(orientPx[1], inBox[1])];
};

//
export const floorInCX = ($CX: [number, number], gridArgs: GridArgsType) => {
    const layout = gridArgs.page.layout;
    return [
        Math.min(Math.max(roundNearest($CX[0]), 0), layout[0]-1),
        Math.min(Math.max(roundNearest($CX[1]), 0), layout[1]-1)
    ];
};
