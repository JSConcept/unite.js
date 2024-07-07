// @ts-nocheck

//
import {hexFromArgb} from "@material/material-color-utilities";
import {formatCss, formatHex, interpolate, oklch, parse} from "culori";
import {sourceColorFromImage} from "./ColorMod.mjs/index.js";

//
import {setStyleRule} from "../dom/StyleWork.ts/index.js";

//
export const provide = async (path = "", rw = false) => {
    const relPath = path.replace(location.origin, "");
    if (relPath.startsWith("/opfs")) {
        const params = relPath.split(/\?/i)?.[1] || relPath;
        const $path = new URLSearchParams(params).get("path");
        const parts = $path?.split?.("/") || $path || "";

        //
        let dir = await navigator?.storage
            ?.getDirectory?.()
            ?.catch?.(console.warn.bind(console));
        for (let I = 0; I < parts.length - 1; I++) {
            if (!parts[I]) continue;
            dir = await dir
                ?.getDirectoryHandle?.(parts[I], { create: rw })
                ?.catch?.(console.warn.bind(console));
            if (!dir) break;
        }

        //
        const fileh = await dir?.getFileHandle?.(parts[parts.length - 1], {
            create: rw,
        });
        return await fileh?.[rw ? "createWritable" : "getFile"]?.();
    } else if (relPath.startsWith("/")) {
        return fetch(path).then((r) => r.blob());
    }
    return null;
};

//
const lightMods = ["#000000", "#FFFFFF"],
    darkMods = ["#FFFFFF", "#000000"];
let baseColorI = {};
let baseColorH = "#FFFFFF";
let baseColor =
    localStorage.getItem("--theme-base-color") || "oklch(50% 0.3 0)";
let surfaceColorI = {};
let surfaceColorH = "#FFFFFF";
let surfaceColor = "#FFFFFF";
let chromaMod = {};
let cssIsDark =
    parseInt(localStorage.getItem("--theme-wallpaper-is-dark") || "0") || 0;

//
setStyleRule(":host, :root, :scope, :where(*)", {
    "--theme-base-color": baseColor,
    "--theme-wallpaper-is-dark": cssIsDark,
});

//
export const switchTheme = (isDark = false) => {
    if (!baseColorI) return;

    // used in UI
    surfaceColorI = interpolate(
        [baseColorI, [lightMods, darkMods][isDark - 0][1]],
        "oklch",
        {}
    )(0.96);

    //
    surfaceColorH = formatHex(surfaceColorI);
    surfaceColor = formatCss(baseColorI);

    //
    const media = document?.head?.querySelector?.(
        'meta[name="theme-color"]:not([media])'
    );
    if (media) {
        media.content = surfaceColorH;
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
    const cssIsDark = Math.sign(0.65 - commonOkLch.l) * 0.5 + 0.5;

    //
    baseColorI = interpolate([commonOkLch, chromaOkLch], "oklch", {
        // spline instead of linear interpolation:
    })(0.8);

    //
    baseColorI.h ||= 0;

    //
    const whiteMod = { ...baseColorI };
    whiteMod.c = 0.01;
    whiteMod.l = 0.99;

    //
    const blackMod = { ...baseColorI };
    blackMod.c = 0.01;
    blackMod.l = 0.01;

    //
    chromaMod = { ...baseColorI };
    chromaMod.c = 0.99;

    //
    lightMods[0] = interpolate([baseColorI, blackMod], "oklch", {})(0.98);
    lightMods[1] = interpolate([baseColorI, whiteMod], "oklch", {})(0.9);

    //
    darkMods[0] = interpolate([baseColorI, whiteMod], "oklch", {})(0.98);
    darkMods[1] = interpolate([baseColorI, blackMod], "oklch", {})(0.9);

    //
    baseColorH = formatHex(baseColorI);
    baseColor = formatCss(baseColorI);

    //
    if (baseColor) {
        setStyleRule(":host, :root, :scope, :where(*)", {
            "--theme-base-color": baseColor,
            "--theme-wallpaper-is-dark": cssIsDark,
        });

        //
        localStorage.setItem("--theme-base-color", baseColor);
        localStorage.setItem("--theme-wallpaper-is-dark", cssIsDark);
    }

    //
    switchTheme(false);
};

//
window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", ({ matches }) => {
        switchTheme(matches);
    });

//
window.addEventListener("wallpaper", (ev) => {
    const blob = ev?.detail?.blob;
    if (blob)
        colorScheme(blob)
            .then(() => {
                const filename =
                    "/opfs?path=images/" + (blob.name || "wallpaper");
                provide(filename, true)
                    .then(async (fw) => {
                        localStorage.setItem("@wallpaper", filename);
                        await fw?.write?.(blob);
                        await fw?.flush?.();
                        await fw?.close?.();
                    })
                    .catch(console.warn.bind(console));
            })
            .catch(console.warn.bind(console));
});
