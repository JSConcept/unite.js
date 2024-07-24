// @ts-ignore
import {hexFromArgb} from "@material/material-color-utilities";

// @ts-ignore
import {formatCss, formatHex, interpolate, oklch, parse} from "culori";

//
import {setStyleRule} from "./StyleRules.ts";
import {sourceColorFromImage} from "../utils/ColorMod.ts";

//
//let baseColorH: string = "#FFFFFF";
//let surfaceColor: string = "#FFFFFF";

//
const lightMods: string[] = ["#000000", "#FFFFFF"], darkMods: string[] = ["#FFFFFF", "#000000"];
let baseColorI: any = {};
let baseColor: string = localStorage.getItem("--theme-base-color") || "oklch(50% 0.3 0)";
let surfaceColorI: any = {};
let surfaceColorH: string = "#FFFFFF";
let chromaMod: any = {};
let cssIsDark =
    parseInt(localStorage.getItem("--theme-wallpaper-is-dark") || "0") || 0;

//
const updateStyleRule = ()=>{
    setStyleRule(":host, :root, :scope, :where(*)", {
        "--theme-base-color": baseColor,
        "--theme-wallpaper-is-dark": cssIsDark,
    });
}

//
export const switchTheme = (isDark = false) => {
    if (!baseColorI) return;

    // used in UI
    surfaceColorI = interpolate(
        [baseColorI, [lightMods, darkMods][(isDark ? 1 : 0) - 0][1]],
        "oklch",
        {}
    )(0.96);

    //
    surfaceColorH = formatHex(surfaceColorI);
    //surfaceColor = formatCss(baseColorI);

    //
    const media = document?.head?.querySelector?.('meta[data-theme-color]');
    if (media) { media.setAttribute("content", baseColor); }
};

//
export const colorScheme = async (blob) => {
    const image = await createImageBitmap(blob);
    const [chroma, common] = await sourceColorFromImage(image);

    //
    const chromaHex = hexFromArgb(chroma);
    const commonHex = hexFromArgb(common);

    //
    const chromaOkLch = oklch(parse(chromaHex));
    const commonOkLch = oklch(parse(commonHex));

    //
    const cssIsDark: number = Math.sign(0.65 - commonOkLch.l) * 0.5 + 0.5;

    //
    baseColorI = interpolate([commonOkLch, chromaOkLch], "oklch", {
        // spline instead of linear interpolation:
    })(0.8);

    //
    baseColorI.h ||= 0;

    //
    const whiteMod = {...baseColorI};
    whiteMod.c = 0.01;
    whiteMod.l = 0.99;

    //
    const blackMod = {...baseColorI};
    blackMod.c = 0.01;
    blackMod.l = 0.01;

    //
    chromaMod = {...baseColorI};
    chromaMod.c = 0.99;

    //
    lightMods[0] = interpolate([baseColorI, blackMod], "oklch", {})(0.98);
    lightMods[1] = interpolate([baseColorI, whiteMod], "oklch", {})(0.9);

    //
    darkMods[0] = interpolate([baseColorI, whiteMod], "oklch", {})(0.98);
    darkMods[1] = interpolate([baseColorI, blackMod], "oklch", {})(0.9);

    //
    //baseColorH = formatHex(baseColorI);
    baseColor = formatCss(baseColorI);

    //
    if (baseColor) {
        updateStyleRule();

        //
        localStorage.setItem("--theme-base-color", baseColor);
        localStorage.setItem("--theme-wallpaper-is-dark", cssIsDark as unknown as string);
    }

    //
    switchTheme(false);
};

//
updateStyleRule();

//
window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", ({matches}) => {
        switchTheme(matches);
    });
