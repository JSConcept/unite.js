// @ts-nocheck

//
import {getCorrectOrientation} from "../utils/utils";

//
const styleElement = document.createElement("style");
document.querySelector("head")?.appendChild?.(styleElement);

//
let shapeCount = 0;

//
export const setStyleRule = (selector, sheet) => {
    const styleRules = styleElement.sheet;
    let ruleId = Array.from(styleRules?.cssRules || []).findIndex(({selectorText})=>(selector == selectorText));
    if (ruleId <= -1) { ruleId = styleRules.insertRule(`${selector} {}`); }

    //
    const rule = styleElement.sheet.cssRules[ruleId];
    Object.entries(sheet).map(([propName, propValue])=>{
        const exists = rule.style.getPropertyValue(propName);
        if (!exists || exists != propValue) {
            rule.style.setProperty(propName, propValue, "");
        }
    });
}

//
export const setStyleRules = (classes) => {
    return classes?.map?.((args)=>setStyleRule(...args));
}

//
export const WavyShapedCircle = (applicant = null)=>{
    const steps = 100;
    const cx = 0.5;
    const cy = 0.5;
    const ampl = 0.06;
    const freq = 8;
    const radius = 0.5;

    //
    const points = [];
    for (let i=0;i<steps;i++) {
        points.push(i/steps);
    }

    /*for (let i=0;i<steps;i++) {
        const angle = (i / steps) * 2 * Math.PI;
        const variant = (Math.cos(freq * angle) * 0.5 + 0.5) * ampl;
        const rx = cx + Math.cos(angle) * (radius - variant);
        const ry = cy + Math.sin(angle) * (radius - variant);
        points.push([rx, ry]);
    }*/
// * 0.5 + 0.5
    const angle = (step)=>{
        return `calc(${step}rad * pi * 2)`;
    }

    //
    const variant = (step)=>{
        return `calc(calc(cos(calc(var(--clip-freq) * ${angle(step)})) * 0.5 + 0.5) * var(--clip-ampl))`
    }

    //
    const func = (step)=>{
        return [
            `calc(calc(0.5 + calc(cos(${angle(step)}) * calc(0.5 - ${variant(step)}))) * 100%)`,
            `calc(calc(0.5 + calc(sin(${angle(step)}) * calc(0.5 - ${variant(step)}))) * 100%)`
        ];
    }

    //
    const d = points.map((step)=>{ const stp = func(step).join(" "); return stp}).join(", ");

    //
    return {
        "--clip-ampl": ampl,
        "--clip-freq": freq,
        "--clip-path": `polygon(${d})`
    }
}

//
const properties = [
    { name: "--clip-ampl", syntax: "<number>", inherits: true, initialValue: "0" },
    { name: "--clip-freq", syntax: "<number>", inherits: true, initialValue: "0" },
    { name: "--pfrot", syntax: "<angle>", inherits: true, initialValue: "0deg" },
    { name: "--lfrot", syntax: "<angle>", inherits: true, initialValue: "0deg" },
    { name: "--prot", syntax: "<angle>", inherits: true, initialValue: "0deg" },
    { name: "--lrot", syntax: "<angle>", inherits: true, initialValue: "0deg" },
    { name: "--pth", syntax: "<length-percentage>", inherits: true, initialValue: "0px" },
    { name: "--ptw", syntax: "<length-percentage>", inherits: true, initialValue: "0px" },
    { name: "--lth", syntax: "<length-percentage>", inherits: true, initialValue: "0px" },
    { name: "--ltw", syntax: "<length-percentage>", inherits: true, initialValue: "0px" },
    { name: "--ptrans-x", syntax: "<length-percentage>", inherits: true, initialValue: "0px" },
    { name: "--ptrans-y", syntax: "<length-percentage>", inherits: true, initialValue: "0px" },
    { name: "--ltrans-x", syntax: "<length-percentage>", inherits: true, initialValue: "0px" },
    { name: "--ltrans-y", syntax: "<length-percentage>", inherits: true, initialValue: "0px" },
    { name: "--avail-width", syntax: "<length-percentage>", inherits: true, initialValue: "0px" },
    { name: "--avail-height", syntax: "<length-percentage>", inherits: true, initialValue: "0px" },
    { name: "--pixel-ratio", syntax: "<number>", inherits: true, initialValue: "1" },
];

// define properties
properties.map((o)=>CSS?.registerProperty?.(o));

//
const displayPortrait90deg  = { "--pwm": "vertical-rl"  , "--pdir": "ltr", "--pfrot": "0deg" };
const displayPortrait0deg   = { "--pwm": "horizontal-tb", "--pdir": "ltr", "--pfrot": "0deg" };
const displayPortrait180deg = { "--pwm": "horizontal-tb", "--pdir": "ltr", "--pfrot": "180deg"};
const displayPortrait270deg = CSS.supports("writing-mode", "sideways-lr") ?
{ "--pwm": "sideways-lr", "--pdir": "ltr", "--pfrot": "0deg" } :
{ "--pwm": "vertical-lr", "--pdir": "rtl", "--pfrot": "0deg" };
//
const displayLandscape90deg  = { "--lwm": "vertical-rl"  , "--ldir": "ltr", "--lfrot": "0deg" };
const displayLandscape0deg   = { "--lwm": "horizontal-tb", "--ldir": "ltr", "--lfrot": "0deg" };
const displayLandscape180deg = { "--lwm": "horizontal-tb", "--ldir": "ltr", "--lfrot": "180deg" };
const displayLandscape270deg = CSS.supports("writing-mode", "sideways-lr") ?
{ "--lwm": "sideways-lr", "--ldir": "ltr", "--lfrot": "0deg" } :
{ "--lwm": "vertical-lr", "--ldir": "rtl", "--lfrot": "0deg" };




//
const portrait0deg   = { "--prot" : "0deg" };
const portrait90deg  = { "--prot": "90deg"};
const portrait180deg = { "--prot": "180deg" };
const portrait270deg = { "--prot": "270deg" };

//
const landscape0deg   = { "--lrot": "0deg" };
const landscape90deg  = { "--lrot": "90deg" };
const landscape180deg = { "--lrot": "180deg" };
const landscape270deg = { "--lrot": "270deg" };



//
const ptsLandscape = {
    "--ptw": "100cqb",
    "--pth": "100cqi",
}

//
const ptsPortrait = {
    "--ptw": "100cqi",
    "--pth": "100cqb"
}

//
const ltsLandscape = {
    "--ltw": "100cqi",
    "--lth": "100cqb"
}

//
const ltsPortrait = {
    "--ltw": "100cqb",
    "--lth": "100cqi"
}


//
const ptransLandscape = {
    "--ptrans-x": "calc(var(--h) * 0.5 + calc(var(--rx) * 1px + var(--cx)) - 50%)",
    "--ptrans-y": "calc(var(--w) * 0.5 + calc(var(--ry) * 1px + var(--cy)) - 50%)"
}

//
const ptransPortrait = {
    "--ptrans-x": "calc(var(--w) * 0.5 + calc(var(--rx) * 1px + var(--cx)) - 50%)",
    "--ptrans-y": "calc(var(--h) * 0.5 + calc(var(--ry) * 1px + var(--cy)) - 50%)"
}

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
const cloudyShape = WavyShapedCircle();

//
const availSize = {
    "--avail-width": Math.min(screen.availWidth || 0, screen.width || 0) + "px",
    "--avail-height":
        Math.min(screen.availHeight || 0, screen.height || 0) + "px",
    "--vs-width": (visualViewport?.width || 0) + "px",
    "--vs-height": (visualViewport?.height || 0) + "px",
    "--pixel-ratio": devicePixelRatio || 1,
};

//
const updateOrientation = (e) => {
    Object.assign(availSize, {
        "--avail-width":
            Math.min(screen.availWidth || 0, screen.width || 0) + "px",
        "--avail-height":
            Math.min(screen.availHeight || 0, screen.height || 0) + "px",
        "--vs-width": (visualViewport?.width || 0) + "px",
        "--vs-height": (visualViewport?.height || 0) + "px",
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
            break;
    }
};

//
const classes = [
    [":root, :host, :scope", cloudyShape],
    [":root, :host, :scope", portrait],
    [":root, :host, :scope", landscape],
    [":root, :host, :scope", displayPortrait],
    [":root, :host, :scope", displayLandscape],
    [":root, :host, :scope", lts],
    [":root, :host, :scope", pts],
    [":root, :host, :scope", availSize],
];

//
const updateDynamic = (e) => {
    updateOrientation(e);
    setStyleRules(classes);
};

//
navigator?.virtualKeyboard?.addEventListener?.(
    "geometrychange",
    updateDynamic,
    { passive: true }
);
document.documentElement.addEventListener("DOMContentLoaded", updateDynamic, {
    passive: true,
});
screen.orientation.addEventListener("change", updateDynamic, { passive: true });
self.addEventListener("resize", updateDynamic, { passive: true });
updateDynamic();

// pre-fix full-screen mode
document.documentElement.addEventListener(
    "click",
    () => {
        if (
            matchMedia(
                "all and ((display-mode: fullscreen) or (display-mode: standalone))"
            ).matches
        ) {
            /*document?.body
                ?.requestFullscreen?.({
                    navigationUI: "hide",
                })
                ?.catch(console.warn.bind(console));*/
        }
    },
    { passive: true, capture: true }
);
