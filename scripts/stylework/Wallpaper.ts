
import {colorScheme} from "./ColorTheme.ts"

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
                ?.getDirectoryHandle?.(parts[I], {create: rw})
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
window.addEventListener("wallpaper", (ev) => {
    const blob = ev?.detail?.blob;
    if (blob)
        colorScheme(blob)
            .then(() => {
                const filename =
                    "/opfs?path=images/" + (blob.name || "wallpaper");

                //
                if (!ev.detail.doNotRewrite) {
                    provide(filename, true)
                        .then(async (fw: any) => {
                            localStorage.setItem("@wallpaper", filename);
                            await fw?.write?.(blob);
                            await fw?.flush?.();
                            await fw?.close?.();
                        })
                        .catch(console.warn.bind(console));
                } else {
                    localStorage.setItem("@wallpaper", filename);
                }
            })
            .catch(console.warn.bind(console));
});
