//
import {getCorrectOrientation} from "../utils/Utils.ts";

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
export const redirectCell = (
    {gridPage, iconItem, iconItems},
    $preCell
) => {
    //const items = iconItems;
    const preCell = {...$preCell}; // make non-conflict copy
    const icons =
        gridPage.list?.map((id) => iconItems.get(id)).filter((m) => !!m) || [];

    //
    const checkBusy = (cell) => {
        return icons
            .filter((e) => e != iconItem && e.id != iconItem.id)
            .find((one) => {
                return one.cellX == cell.x && one.cellY == cell.y;
            });
    };

    //
    if (!checkBusy(preCell)) {
        iconItem.cellX = preCell.x;
        iconItem.cellY = preCell.y;
        return {x: iconItem.cellX, y: iconItem.cellY};
    }

    //
    const columns = gridPage.layout[0] || 4;
    const rows = gridPage.layout[1] || 8;

    //
    const variants = [
        {x: preCell.x + 1, y: preCell.y},
        {x: preCell.x - 1, y: preCell.y},
        {x: preCell.x, y: preCell.y + 1},
        {x: preCell.x, y: preCell.y - 1},
    ].filter((v) => {
        return v.x >= 0 && v.x < columns && v.y >= 0 && v.y < rows;
    });

    //
    const suitable = variants.find((v) => !checkBusy(v));
    if (suitable) {
        iconItem.cellX = suitable.x;
        iconItem.cellY = suitable.y;
        return {x: iconItem.cellX, y: iconItem.cellY};
    }

    //
    let exceed = 0;
    let busy = checkBusy(preCell);
    while (busy && exceed++ < columns * rows) {
        if (!busy) {
            iconItem.cellX = preCell.x;
            iconItem.cellY = preCell.y;
            return {x: iconItem.cellX, y: iconItem.cellY};
        }

        //
        preCell.x++;
        if (preCell.x >= columns) {
            preCell.x = 0;
            preCell.y++;

            //
            if (preCell.y >= rows) {
                preCell.y = 0;
            }
        }

        //
        busy = checkBusy(preCell);
    }

    return preCell;
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
const isMobile = () => {
    const regex =
        /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return regex.test(navigator.userAgent);
};

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
            gridColumn: "var(--p-cell-x)",
            gridRow: "var(--p-cell-y)",
            easing: "step-start",
            offset: 0.0,
        },
        {
            "--translate-x": "calc(var(--drag-x) * 1px)",
            "--translate-y": "calc(var(--drag-y) * 1px)",
            gridColumn: "var(--p-cell-x)",
            gridRow: "var(--p-cell-y)",
            easing: "linear",
            offset: 0.01,
        },
        {
            gridColumn: "var(--p-cell-x)",
            gridRow: "var(--p-cell-y)",
            ...getOrientedPoint(),
            easing: "step-end",
            offset: 0.99,
        },
        {
            gridColumn: "var(--cell-x)",
            gridRow: "var(--cell-y)",
            "--drag-x": 0,
            "--drag-y": 0,
            easing: "step-end",
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
export const putToCell = ({
    gridPage,
    iconItems,
    iconItem,
}, $coord) => {
    // should be relative from grid-box (not absolute or fixed position)
    const last = {...$coord};

    //
    const orientation = getCorrectOrientation();
    const oxBox = gridPage.size;

    //
    if (orientation.startsWith("landscape")) oxBox.reverse();

    //
    const inBox = [oxBox[0] / gridPage.layout[0], oxBox[1] / gridPage.layout[1]];

    //
    const preCell = {x: iconItem.cellX || 0, y: iconItem.cellY || 0};
    (iconItem.pCellX = iconItem.cellX || 0);
    (iconItem.pCellY = iconItem.cellY || 0);

    //
    switch (orientation) {
        case "portrait-primary":
            preCell.x = Math.floor(last.x / inBox[0]) || 0;
            preCell.y = Math.floor(last.y / inBox[1]) || 0;
            break;
        case "landscape-primary":
            preCell.x = Math.floor((oxBox[0] - last.y) / inBox[0]) || 0;
            preCell.y = Math.floor(last.x / inBox[1]) || 0;
            break;
        case "portrait-secondary":
            preCell.x = Math.floor((oxBox[0] - last.x) / inBox[0]) || 0;
            preCell.y = Math.floor((oxBox[1] - last.y) / inBox[1]) || 0;
            break;
        case "landscape-secondary":
            preCell.x = Math.floor(last.y / inBox[0]) || 0;
            preCell.y = Math.floor((oxBox[1] - last.x) / inBox[1]) || 0;
            break;
    }

    //
    const fValue = redirectCell(
        {
            gridPage,
            iconItem,
            iconItems
        },
        preCell
    );

    //
    return fValue;
};
