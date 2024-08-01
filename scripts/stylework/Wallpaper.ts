
import {colorScheme} from "./ColorTheme.ts";
import { provide } from "../utils/Utils.ts";

//
window.addEventListener("wallpaper", (ev) => {
    const blob = ev?.detail?.blob;
    const dnw = ev?.detail?.doNotRewrite ?? true;
    if (blob)
        colorScheme(blob)
            .then(() => {
                const filename =
                    "/opfs?path=images/" + (blob.name || "wallpaper");

                //
                if (!dnw) {
                    provide(filename, true)
                        .then(async (fw: any) => {
                            localStorage.setItem("@wallpaper", filename);
                            await fw?.write?.(blob);
                            await fw?.flush?.();
                            await fw?.close?.();
                            window.dispatchEvent(new CustomEvent("file-upload", {detail: {blob}}));
                        })
                        .catch(console.warn.bind(console));
                } else {
                    localStorage.setItem("@wallpaper", filename);
                }
            })
            .catch(console.warn.bind(console));
});
