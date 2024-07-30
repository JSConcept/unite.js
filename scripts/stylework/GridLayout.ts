//
import { getCorrectOrientation, whenAnyScreenChanges } from "../utils/Utils.ts";

//
import { setStyleRules } from "./StyleRules.ts";
import type {StyleTuple} from "./StyleRules.ts";

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
export const getOrientedPoint = () => {
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
                "--translate-x": `calc(calc(calc(var(--grid-w) / var(--f-row)) * var(--vect-y)) * 1px)`,
                "--translate-y": `calc(calc(calc(var(--grid-h) / var(--f-col)) * var(--vect-x)) * -1px)`,
            };

        case "landscape-secondary":
            return {
                "--translate-x": `calc(calc(calc(var(--grid-w) / var(--f-row)) * var(--vect-y)) * -1px)`,
                "--translate-y": `calc(calc(calc(var(--grid-h) / var(--f-col)) * var(--vect-x)) * 1px)`,
            };

        default:
            return {
                "--translate-x": `calc(calc(calc(var(--grid-w) / var(--f-col)) * var(--vect-x)) * 1px)`,
                "--translate-y": `calc(calc(calc(var(--grid-h) / var(--f-row)) * var(--vect-y)) * 1px)`,
            };
    }
};
//CSS.supports("display", "layout(grid-page)") ?
//
export const animationSequence = () => {
    return [
        {
            "--translate-x": "calc(var(--drag-x) * var(--zpx, 1px))",
            "--translate-y": "calc(var(--drag-y) * var(--zpx, 1px))",
            "--grid-column": "var(--fp-cell-x)",
            "--grid-row": "var(--fp-cell-y)",
            easing: "linear",
            offset: 0.0,
        },
        {
            "--translate-x": "0px",
            "--translate-y": "0px",
            "--grid-column": "var(--fc-cell-x)",
            "--grid-row": "var(--fc-cell-y)",
            easing: "linear",
            offset: 1,
        }
    ];
};





//
const realCellOriented = {
    "portrait-primary": {
        "grid-column": "var(--grid-column)",
        "grid-row": "var(--grid-row)",
    },
    "landscape-primary": {
        "grid-column": "var(--grid-row)",
        "grid-row": "calc(var(--columns) - var(--grid-column) + 1)",
    },
    "portrait-secondary": {
        "grid-column": "calc(var(--columns) - var(--grid-column) + 1)",
        "grid-row": "calc(var(--rows) - var(--grid-row) + 1)",
    },
    "landscape-secondary": {
        "grid-column": "calc(var(--rows) - var(--grid-row) + 1)",
        "grid-row": "var(--grid-column)",
    }
};

//
const currentCellLayout = {...realCellOriented[getCorrectOrientation()]};

//
export const updateOrientation = (_) => {
    Object.assign(currentCellLayout, realCellOriented[getCorrectOrientation()]);
};

//
const classes: StyleTuple[] = [
    [":where(.ux-grid-item), :where(.ux-grid-page > *), :where(.ux-grid-item-label)", currentCellLayout]
];

//
whenAnyScreenChanges((e?: any) => {
    updateOrientation(e);
    setStyleRules(classes);
});
