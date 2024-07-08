//
import {makeReactiveObject} from "../reactive/ReactiveObject.ts";
import {getCorrectOrientation, isMobile} from "../utils/Utils.ts";

//
export interface GridItemType {
    cell: [number, number];
    id: string;
    label: string;
    pointerId: number;
    icon: string;
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
        gridArgs.page.list?.map((id) => gridArgs.items.get(id)).filter((m) => !!m) || [];

    //
    const checkBusy = (cell) => {
        return icons
            .filter((e) => e != gridArgs.item && e.id != gridArgs.item.id)
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
    const columns = gridArgs.page.layout[0] || 4;
    const rows = gridArgs.page.layout[1] || 8;

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
    return makeReactiveObject(preCell);
};

//
CSS?.registerProperty?.({
    name: "--translate-x",
    syntax: "<length-percentage>",
    inherits: true,
    initialValue: "0px",
});

//
CSS?.registerProperty?.({
    name: "--translate-y",
    syntax: "<length-percentage>",
    inherits: true,
    initialValue: "0px",
});

//
const getOrientedPoint = () => {
    const orientation = getCorrectOrientation();
    switch (orientation) {
        case "portrait-primary":
            return {
                "--translate-x": `calc(calc(calc(var(--grid-w) / var(--f-col)) * var(--vect-x)) * 1px)`,
                "--translate-y": `calc(calc(calc(var(--grid-h) / var(--f-row)) * var(--vect-y)) * 1px)`,
            };

        case "portrait-secondary":
            return {
                "--translate-x": `calc(calc(calc(var(--grid-w) / var(--f-col)) * var(--vect-x)) * -1px)`,
                "--translate-y": `calc(calc(calc(var(--grid-h) / var(--f-row)) * var(--vect-y)) * -1px)`,
            };

        case "landscape-primary":
            return {
                "--translate-x": `calc(calc(calc(var(--grid-${isMobile() ? "h" : "w"
                    }) / var(--f-row)) * var(--vect-y)) * 1px)`,
                "--translate-y": `calc(calc(calc(var(--grid-${isMobile() ? "w" : "h"
                    }) / var(--f-col)) * var(--vect-x)) * -1px)`,
            };

        case "landscape-secondary":
            return {
                "--translate-x": `calc(calc(calc(var(--grid-${isMobile() ? "h" : "w"
                    }) / var(--f-row)) * var(--vect-y)) * -1px)`,
                "--translate-y": `calc(calc(calc(var(--grid-${isMobile() ? "w" : "h"
                    }) / var(--f-col)) * var(--vect-x)) * 1px)`,
            };

        default:
            return {
                "--translate-x": `calc(calc(calc(var(--grid-w) / var(--f-col)) * var(--vect-x)) * 1px)`,
                "--translate-y": `calc(calc(calc(var(--grid-h) / var(--f-row)) * var(--vect-y)) * 1px)`,
            };
    }
};

//
export const animationSequence = () => {
    return [
        {
            "--translate-x": "calc(var(--drag-x) * 1px)",
            "--translate-y": "calc(var(--drag-y) * 1px)",
            gridColumn: "var(--fp-cell-x)",
            gridRow: "var(--fp-cell-y)",
            easing: "step-end",
            offset: 0.0,
        },
        {
            "--translate-x": "calc(var(--drag-x) * 1px)",
            "--translate-y": "calc(var(--drag-y) * 1px)",
            gridColumn: "var(--fp-cell-x)",
            gridRow: "var(--fp-cell-y)",
            easing: "linear",
            offset: 0.01,
        },
        {
            gridColumn: "var(--fp-cell-x)",
            gridRow: "var(--fp-cell-y)",
            ...getOrientedPoint(),
            easing: "step-start",
            offset: 0.99,
        },
        {
            gridColumn: "var(--fc-cell-x)",
            gridRow: "var(--fc-cell-y)",
            "--drag-x": 0,
            "--drag-y": 0,
            "--translate-x": "0px",
            "--translate-y": "0px",
            easing: "step-start",
            offset: 1,
        },
    ];
};

//
/*export const gridPage = {
    size: [0, 0],
    layout: [4, 8],
    list: []
}*/

//
export const putToCell = (gridArgs: GridArgsType, $coord: [number, number]) => {
    // should be relative from grid-box (not absolute or fixed position)
    const last: [number, number] = [...$coord];

    //
    const orientation = getCorrectOrientation();
    const oxBox = gridArgs.page.size;

    //
    //if (orientation.startsWith("landscape")) oxBox.reverse();

    //
    const inBox = [oxBox[0] / gridArgs.page.layout[0], oxBox[1] / gridArgs.page.layout[1]];
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
