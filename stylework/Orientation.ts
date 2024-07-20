import { setStyleRules } from "./StyleRules.ts";
import type {StyleTuple} from "./StyleRules.ts";

//
import {getCorrectOrientation} from "../utils/Utils.ts";

//
const displayPortrait90deg = {
    "--pwm": "vertical-rl",
    "--pdir": "ltr",
    "--pfrot": "0deg",
};
const displayPortrait0deg = {
    "--pwm": "horizontal-tb",
    "--pdir": "ltr",
    "--pfrot": "0deg",
};
const displayPortrait180deg = {
    "--pwm": "horizontal-tb",
    "--pdir": "ltr",
    "--pfrot": "180deg",
};
const displayPortrait270deg = CSS.supports("writing-mode", "sideways-lr")
    ? {"--pwm": "sideways-lr", "--pdir": "ltr", "--pfrot": "0deg"}
    : {"--pwm": "vertical-lr", "--pdir": "rtl", "--pfrot": "0deg"};
//
const displayLandscape90deg = {
    "--lwm": "vertical-rl",
    "--ldir": "ltr",
    "--lfrot": "0deg",
};
const displayLandscape0deg = {
    "--lwm": "horizontal-tb",
    "--ldir": "ltr",
    "--lfrot": "0deg",
};
const displayLandscape180deg = {
    "--lwm": "horizontal-tb",
    "--ldir": "ltr",
    "--lfrot": "180deg",
};
const displayLandscape270deg = CSS.supports("writing-mode", "sideways-lr")
    ? {"--lwm": "sideways-lr", "--ldir": "ltr", "--lfrot": "0deg"}
    : {"--lwm": "vertical-lr", "--ldir": "rtl", "--lfrot": "0deg"};



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
const orient0deg = {"--orient": 0};
const orient90deg = {"--orient": 1};
const orient180deg = {"--orient": 2};
const orient270deg = {"--orient": 3};

//
const portrait0deg = {"--prot": "0deg"};
const portrait90deg = {"--prot": "90deg"};
const portrait180deg = {"--prot": "180deg"};
const portrait270deg = {"--prot": "270deg"};

//
const landscape0deg = {"--lrot": "0deg"};
const landscape90deg = {"--lrot": "90deg"};
const landscape180deg = {"--lrot": "180deg"};
const landscape270deg = {"--lrot": "270deg"};

//
const ptsLandscape = {
    "--ptw": "100cqb",
    "--pth": "100cqi",
};

//
const ptsPortrait = {
    "--ptw": "100cqi",
    "--pth": "100cqb",
};

//
const ltsLandscape = {
    "--ltw": "100cqi",
    "--lth": "100cqb",
};

//
const ltsPortrait = {
    "--ltw": "100cqb",
    "--lth": "100cqi",
};

//
const currentCellLayout = {...realCellOriented[getCorrectOrientation()]};

//
const landscape = Object.assign({}, landscape0deg);
const portrait = Object.assign({}, portrait90deg);

//
const displayLandscape = Object.assign({}, displayLandscape0deg);
const displayPortrait = Object.assign({}, displayPortrait90deg);

//
const lts = Object.assign({}, ltsLandscape);
const pts = Object.assign({}, ptsLandscape);

//
const currentOrient = Object.assign({}, orient0deg);

//
const availSize = {
    "--avail-width": Math.max(Math.min(screen.availWidth || 0, screen.width || 0), window.innerWidth || 0) + "px",
    "--avail-height": Math.max(Math.min(screen.availHeight || 0, screen.height || 0), window.innerHeight || 0) + "px",
    "--pixel-ratio": devicePixelRatio || 1,
};

//
export const updateOrientation = (_) => {
    Object.assign(currentCellLayout, realCellOriented[getCorrectOrientation()]);

    //
    Object.assign(availSize, {
        "--avail-width": Math.max(Math.min(screen.availWidth || 0, screen.width || 0), window.innerWidth || 0) + "px",
        "--avail-height": Math.max(Math.min(screen.availHeight || 0, screen.height || 0), window.innerHeight || 0) + "px",
        "--pixel-ratio": devicePixelRatio || 1,
    });

    //
    switch (getCorrectOrientation()) {
        case "portrait-primary":
            Object.assign(landscape, landscape90deg);
            Object.assign(portrait, portrait0deg);

            //
            Object.assign(displayLandscape, displayLandscape90deg);
            Object.assign(displayPortrait, displayPortrait0deg);

            //
            Object.assign(lts, ltsPortrait);
            Object.assign(pts, ptsPortrait);

            //
            Object.assign(currentOrient, orient0deg);

            ///
            break;

        case "landscape-primary":
            Object.assign(landscape, landscape0deg);
            Object.assign(portrait, portrait270deg);

            //
            Object.assign(displayLandscape, displayLandscape0deg);
            Object.assign(displayPortrait, displayPortrait270deg);

            //
            Object.assign(lts, ltsLandscape);
            Object.assign(pts, ptsLandscape);

            //
            Object.assign(currentOrient, orient90deg);

            break;

        case "portrait-secondary":
            Object.assign(landscape, landscape270deg);
            Object.assign(portrait, portrait180deg);

            //
            Object.assign(displayLandscape, displayLandscape270deg);
            Object.assign(displayPortrait, displayPortrait180deg);

            //
            Object.assign(lts, ltsPortrait);
            Object.assign(pts, ptsPortrait);

            //
            Object.assign(currentOrient, orient180deg);

            break;

        case "landscape-secondary":
            Object.assign(landscape, landscape180deg);
            Object.assign(portrait, portrait90deg);

            //
            Object.assign(displayLandscape, displayLandscape180deg);
            Object.assign(displayPortrait, displayPortrait90deg);

            //
            Object.assign(lts, ltsLandscape);
            Object.assign(pts, ptsLandscape);

            //
            Object.assign(currentOrient, orient270deg);

            break;
    }
};

//
const classes: StyleTuple[] = [
    [":root, :host, :scope", portrait],
    [":root, :host, :scope", landscape],
    [":root, :host, :scope", displayPortrait],
    [":root, :host, :scope", displayLandscape],
    [":root, :host, :scope", lts],
    [":root, :host, :scope", pts],
    [":root, :host, :scope", availSize],
    [":root, :host, :scope", currentOrient],
    [":where(.ux-grid-item), :where(.ux-grid-page > *), :where(.ux-grid-item-label)", currentCellLayout]
];

//
const updateDynamic = (e?: any) => {
    updateOrientation(e);
    setStyleRules(classes);
};

//
if ("virtualKeyboard" in navigator) {
    // @ts-ignore
    navigator?.virtualKeyboard?.addEventListener?.(
        "geometrychange",
        updateDynamic,
        {passive: true}
    );
}

//
document.documentElement.addEventListener("DOMContentLoaded", updateDynamic, {
    passive: true,
});
screen.orientation.addEventListener("change", updateDynamic, {passive: true});
self.addEventListener("resize", updateDynamic, {passive: true});

//
window?.visualViewport?.addEventListener?.("scroll", updateDynamic);
window?.visualViewport?.addEventListener?.("resize", updateDynamic);

//
document.documentElement.addEventListener("fullscreenchange", updateDynamic);

//
requestAnimationFrame(updateDynamic);
