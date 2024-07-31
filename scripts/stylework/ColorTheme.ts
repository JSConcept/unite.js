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
    localStorage.setItem("--theme-base-color", baseColor);
    localStorage.setItem("--theme-wallpaper-is-dark", cssIsDark as unknown as string);

    //
    setStyleRule(":host, :root, :scope, :where(*)", {
        "--theme-base-color": baseColor,
        "--theme-wallpaper-is-dark": cssIsDark,
    });
}



//
export const pickBgColor = (holder, x, y)=>{
    const source = Array.from(document.elementsFromPoint(x, y));
    const opaque = source.filter((node)=>{
        const computed = getComputedStyle(node as HTMLElement, "");
        const parsed = parse(computed.backgroundColor);
        return (parsed.alpha == null || parsed.alpha > 0.1);
    });

    //
    const color = getComputedStyle(opaque[0] as HTMLElement, "")?.backgroundColor || baseColor;
    if (holder.style.getPropertyValue("--theme-dynamic-color") != color) {
        holder.style.setProperty("--theme-dynamic-color", color, "");
        const media = document?.head?.querySelector?.('meta[data-theme-color]');
        if (media) { media.setAttribute("content", color); }
    }
}

//
export const pickFromCenter = (holder)=>{
    const box = holder?.getBoundingClientRect?.();
    if (box) {
        const xy: [number, number] = [(box.left + box.right) / 2, (box.top + box.bottom) / 2];
        pickBgColor(holder, ...xy);
    }
}

//
export const switchTheme = (isDark = false) => {
    pickBgColor(document.documentElement, window.innerWidth - 64, 30);
};

//
export const colorScheme = async (blob) => {
    const image = await createImageBitmap(blob);
    const [chroma, common] = await sourceColorFromImage(image);

    //
    const chromaOkLch: any = oklch(parse(hexFromArgb(chroma)));
    const commonOkLch: any = oklch(parse(hexFromArgb(common)));

    //
    cssIsDark  = Math.sign(0.65 - commonOkLch.l) * 0.5 + 0.5;
    baseColorI = interpolate([commonOkLch, chromaOkLch], "oklch", {
        // spline instead of linear interpolation:
    })(0.8);

    //
    baseColorI.h ||= 0;
    baseColor = formatCss(baseColorI);

    //
    updateStyleRule();
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
