import "./main.scss";

//
document.documentElement.style.setProperty("--theme-base-color", localStorage.getItem("--theme-base-color") || "oklch(50% 0.3 0)", "");
document.documentElement.style.setProperty("--theme-wallpaper-is-dark", localStorage.getItem("--theme-wallpaper-is-dark") || "0", "");

// avoid any dragging when no-needed...
document.documentElement.addEventListener("dragstart", (ev) => {
    ev.preventDefault();
}, {passive: false, capture: true});

//
if ("virtualKeyboard" in navigator && navigator?.virtualKeyboard) {
    // @ts-ignore
    navigator.virtualKeyboard.overlaysContent = true;
}

//
if (typeof navigator != "undefined") {
    navigator?.serviceWorker?.register?.(new URL('./service.mjs', import.meta.url), {scope: "/"}).then(
        (registration) => {
            console.log('Service worker registration succeeded:', registration);
        },
        (error) => {
            console.error(`Service worker registration failed: ${error}`);
        }
    )?.catch?.(console.warn.bind(console));

    //
    navigator?.registerProtocolHandler?.(
        "web+mxs",
        location.origin + `/opfs?path=%s`
    );
}

// use workers
const loading = Promise.allSettled([
    import("../scrollbox/ScrollBox.ts"),
    import("../core/StyleWork.ts"),
    import("../design/WCanvas.ts").then(
        (_) => import("../design/ColorTheme.ts")
    ),
]);

//
import App from "./Test.svelte";
import {mount} from 'svelte';

//
export default loading.then(() => {
    mount(App, {target: document.body});
});
