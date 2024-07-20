//
import {getCorrectOrientation} from "../utils/Utils.ts";

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

//
export const animationSequence = () => {
    return CSS.supports("display", "layout(grid-page)") ?
        [
            {
                "--translate-x": "calc(var(--drag-x) * 1px)",
                "--translate-y": "calc(var(--drag-y) * 1px)",
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
        ] : [
            {
                "--translate-x": "calc(var(--drag-x) * 1px)",
                "--translate-y": "calc(var(--drag-y) * 1px)",
                "--grid-column": "var(--fp-cell-x)",
                "--grid-row": "var(--fp-cell-y)",
                easing: "step-end",
                offset: 0.0,
            },
            {
                "--translate-x": "calc(var(--drag-x) * 1px)",
                "--translate-y": "calc(var(--drag-y) * 1px)",
                "--grid-column": "var(--fp-cell-x)",
                "--grid-row": "var(--fp-cell-y)",
                easing: "linear",
                offset: 0.01,
            },
            {
                "--grid-column": "var(--fp-cell-x)",
                "--grid-row": "var(--fp-cell-y)",
                ...getOrientedPoint(),
                easing: "step-start",
                offset: 0.99,
            },
            {
                "--grid-column": "var(--fc-cell-x)",
                "--grid-row": "var(--fc-cell-y)",
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
CSS?.registerProperty?.({
    name: "--orient",
    syntax: "<integer>",
    inherits: true,
    initialValue: "0",
});

//
CSS?.registerProperty?.({
    name: "--columns",
    syntax: "<integer>",
    inherits: true,
    initialValue: "1",
});

//
CSS?.registerProperty?.({
    name: "--rows",
    syntax: "<integer>",
    inherits: true,
    initialValue: "1",
});


//
CSS?.registerProperty?.({
    name: "--cell-x",
    syntax: "<integer>",
    inherits: true,
    initialValue: "0",
});

//
CSS?.registerProperty?.({
    name: "--cell-y",
    syntax: "<integer>",
    inherits: true,
    initialValue: "0",
});



//
CSS?.registerProperty?.({
    name: "--grid-column",
    syntax: CSS.supports("display", "layout(grid-page)") ? "<number>" : "<integer>",
    inherits: true,
    initialValue: "0",
});

//
CSS?.registerProperty?.({
    name: "--grid-row",
    syntax: CSS.supports("display", "layout(grid-page)") ? "<number>" : "<integer>",
    inherits: true,
    initialValue: "0",
});


//
if ("layoutWorklet" in CSS) {
    // @ts-ignore
    CSS.layoutWorklet.addModule(new URL("./GridLayoutMod.mjs", import.meta.url).href);
}

