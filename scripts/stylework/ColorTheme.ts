// @ts-ignore
import {hexFromArgb} from "@material/material-color-utilities/index.js";

// @ts-ignore
import {formatCss, formatHex, interpolate, oklch, parse} from "@culori/bundled/culori.mjs";

//
import {setStyleRule} from "./StyleRules.ts";
import {sourceColorFromImage} from "../utils/ColorMod.ts";
import { observeAttributeBySelector } from "../dom/Observer.ts";

//
let baseColorI: any = {};
let baseColor: string = localStorage.getItem("--theme-base-color") || "oklch(50% 0.3 0)";
let cssIsDark = parseInt(localStorage.getItem("--theme-wallpaper-is-dark") || "0") || 0;

//
const electronAPI = "electronBridge";

//
export const updateStyleRule = ($baseColor: string|null = null, $cssIsDark: boolean|null = null)=>{
    localStorage.setItem("--theme-base-color", baseColor = $baseColor ?? baseColor);
    localStorage.setItem("--theme-wallpaper-is-dark", ($cssIsDark ?? cssIsDark) as unknown as string);

    //
    setStyleRule(":host, :root, :scope, :where(*)", {
        "--theme-base-color": baseColor,
        "--theme-wallpaper-is-dark": cssIsDark,
    });
}



//
export const pickBgColor = (x, y, holder: HTMLElement | null = null)=>{
    const source = Array.from(document.elementsFromPoint(x, y));
    const opaque = source.sort((na, nb)=>{
        const zIndexA = parseInt(getComputedStyle(na as HTMLElement, "").zIndex || "0") || 0;
        const zIndexB = parseInt(getComputedStyle(nb as HTMLElement, "").zIndex || "0") || 0;
        return Math.sign(zIndexB - zIndexA);
    }).filter((node)=>{
        if (!(node instanceof HTMLElement)) return false;
        const computed = getComputedStyle(node as HTMLElement, "");
        const value  = computed.backgroundColor || "transparent";
        const parsed = parse(value);
        return ((parsed.alpha == null || parsed.alpha > 0.1) && value != "transparent") && node != holder;
    });

    //
    if (opaque[0] && opaque[0] instanceof HTMLElement) {
        const color = getComputedStyle(opaque[0] as HTMLElement, "")?.backgroundColor || "transparent"; //|| baseColor;
        if (holder && holder.style.getPropertyValue("--theme-dynamic-color") != color) {
            holder.style.setProperty("--theme-dynamic-color", color, "");
        }
        return color;
    }
    return "transparent";
};

//
const makeContrast = (color)=>{
    const cl = oklch(color);
    cl.l = Math.sign(0.5 - cl.l);
    cl.c *= 0.1;
    return formatCss(cl);
}

//
export const pickFromCenter = (holder)=>{
    const box = holder?.getBoundingClientRect?.();
    if (box) {
        const xy: [number, number] = [(box.left + box.right) / 2, (box.top + box.bottom) / 2];
        pickBgColor(...xy, holder);
    }
}

//
export const switchTheme = (isDark = false) => {
    const media = document?.head?.querySelector?.('meta[data-theme-color]');
    const color = pickBgColor(window.innerWidth - 64, 30);

    //
    if (media) { media.setAttribute("content", color); }

    //
    if (window?.[electronAPI]) {
        window?.[electronAPI]?.setThemeColor?.(formatHex(color), formatHex(makeContrast(color)));
    }

    //
    document.querySelectorAll("[data-scheme=\"dynamic-transparent\"], [data-scheme=\"dynamic\"]").forEach((target)=>{
        if (target) {
            pickFromCenter(target);
        }
    });
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


//
// PART II by 26.08.2024, but bit horrible solution
const makeAttrSupport = (selector, attr, type = "number", def = "1")=>{
    //
    if (!CSS.supports("opacity", `attr(${attr} ${type}, 1)`)) {
        observeAttributeBySelector(document.documentElement, selector, attr, (mutation)=>{
            mutation?.target?.style?.setProperty?.(`--${attr}-attr`, mutation.target.getAttribute(attr) ?? def, "");
        });
    }
}

//
makeAttrSupport("*[data-highlight-hover]", "data-highlight-hover");
makeAttrSupport("*[data-highlight]", "data-highlight");
makeAttrSupport("*[data-chroma]", "data-chroma");
makeAttrSupport("*[data-alpha]", "data-alpha");
