
import {colorScheme} from "./ColorTheme.ts";
import { provide, useFS } from "../utils/Utils.ts";

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
                    useFS().then(async (fs)=>{
                        await fs.writeFile("/images/" + (blob.name ?? "wallpaper"), blob);
                        localStorage.setItem("@wallpaper", filename);
                        window.dispatchEvent(new CustomEvent("file-upload", {detail: {blob}}));
                    });
                } else {
                    localStorage.setItem("@wallpaper", filename);
                }
            })
            .catch(console.warn.bind(console));
});
