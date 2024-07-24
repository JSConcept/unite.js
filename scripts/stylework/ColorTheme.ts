// @ts-ignore
import {hexFromArgb} from "@material/material-color-utilities";

// @ts-ignore
import {formatCss, formatHex, interpolate, oklch, parse} from "culori";

//
import {setStyleRule} from "./StyleRules.ts";
import {sourceColorFromImage} from "../utils/ColorMod.ts";

//
let baseColorI: any = {};
let baseColor: string = localStorage.getItem("--theme-base-color") || "oklch(50% 0.3 0)";
let cssIsDark = parseInt(localStorage.getItem("--theme-wallpaper-is-dark") || "0") || 0;

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

    //
    const source = Array.from(document.elementsFromPoint(window.innerWidth - 64, 30));
    const opaque = source.filter((node)=>{
        const computed = getComputedStyle(node as HTMLElement, "");
        const parsed = parse(computed.backgroundColor);
        return (parsed.alpha == null || parsed.alpha > 0.1);
    });

    //
    const color = getComputedStyle(opaque[0] as HTMLElement, "")?.backgroundColor || baseColor;
    if (document.documentElement.style.getPropertyValue("--theme-dynamic-color") != color) {
        document.documentElement.style.setProperty("--theme-dynamic-color", color, "");
        const media = document?.head?.querySelector?.('meta[data-theme-color]');
        if (media) { media.setAttribute("content", color); }
    }
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
    baseColor = formatCss(baseColorI);

    //
    if (baseColor) {
        updateStyleRule();

        //
        localStorage.setItem("--theme-base-color", baseColor);
        localStorage.setItem("--theme-wallpaper-is-dark", cssIsDark as unknown as string);
    }

    //
    switchTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
};

//
updateStyleRule();

//
window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", ({matches}) => { switchTheme(matches); });

//
setInterval(()=>{
    switchTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
}, 500);

//
document.addEventListener("ux-theme-change", ()=>{
    switchTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
});
