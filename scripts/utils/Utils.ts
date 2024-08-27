//
export const or_mod = {
    "landscape-primary": [1, 1, 1],
    "landscape-secondary": [1, 1, 1],
    "portrait-primary": [1, 1, 0],
    "portrait-secondary": [-1, -1, 0],
};

//
export const EmbedStyle = async (shadow, styles) => {
    const style = document.createElement("style");
    //style.setAttribute("scoped", "");
    shadow.appendChild(style);

    //
    style.innerHTML = styles;

    //
    return style;
};

//
export const exchange = (obj, name, value) => {
    const old = obj[name];
    obj[name] = value;
    return old;
};

//
export const clamp = (v, mn, mx) => {
    return Math.min(Math.max(v, mn), mx);
};

//
export const url = (type, ...source) => {
    return URL.createObjectURL(new Blob(source, {type}));
};

//
export const EmbedStyleURL = async (shadow, url) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    link.media = 'all';
    link.crossOrigin = "same-origin";
    shadow?.appendChild?.(link);
    return link;
};

//
export const html = (source, type: DOMParserSupportedType = 'text/html') => {
    const parser = new DOMParser();
    const parsed = parser.parseFromString(source, type);
    return parsed.querySelector('template') ?? parsed.querySelector("*");
};

//
export const detectMobile = () => {
    //
    const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];
    return toMatch.some(navigator.userAgent.match.bind(navigator.userAgent)) && (navigator.maxTouchPoints || 'ontouchstart' in document.documentElement) && window.matchMedia("(pointer: coarse)").matches;
};

//
export const useFS = async() => {
    const opfs = await import('happy-opfs/dist/main.mjs').catch(console.warn.bind(console));
    const deno = typeof Deno != "undefined" ? Deno : null;

    /* @vite-ignore */
    const ignore = "" + "";
    /* @vite-ignore */
    let node = null;
    if (!opfs?.isOPFSSupported()) {
        try {
            node = await import(/*@vite-ignore */ ignore + "node:fs/promises").catch(console.warn.bind(console));
        } catch(e) {
            console.warn(e);
        }
    }

    //
    const fs = opfs?.isOPFSSupported() ? opfs : (deno ?? node);
    return fs;
}

//
export const provide = async (req: string | Request = "", rw = false) => {
    const fs = await useFS();

    //
    const path: string = (req as Request)?.url ?? req;
    const relPath = path.replace(location.origin, "");
    if (relPath.startsWith("/opfs")) {
        const params = relPath.split(/\?/i)?.[1] || relPath;
        const $path = new URLSearchParams(params).get("path");
        const parts = $path?.split?.("/") || [$path] || [""];

        //
        await fs.mkdir("/" + parts.slice(0, parts.length-1)?.join("/"));
        if (rw) {
            return {
                write(data) {
                    return fs.writeFile("/" + $path, data);
                }
            }
        }

        //
        const handle = await fs.readFile("/" + $path, {encoding: "blob"});
        const file = handle?.unwrap?.() ?? handle;
        return file;
    } else {
        return fetch(path).then(async (r) => {
            const blob = await r.blob();
            const lastModified = Date.parse(r.headers.get("Last-Modified") || "") || 0;
            return new File([blob], relPath.substring(relPath.lastIndexOf('/') + 1), {
                type: blob.type,
                lastModified
            });
        });
    }
    return null;
};

//
export const getCorrectOrientation = () => {
    let orientationType: string = screen.orientation.type;
    if (!window.matchMedia("((display-mode: fullscreen) or (display-mode: standalone) or (display-mode: window-controls-overlay))").matches) {
        if (matchMedia("(orientation: portrait)").matches) {orientationType = orientationType.replace("landscape", "portrait");} else
            if (matchMedia("(orientation: landscape)").matches) {orientationType = orientationType.replace("portrait", "landscape");};
    }
    return orientationType;
};

//
export const UUIDv4 = () => {
    return crypto?.randomUUID ? crypto?.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16));
};

//
export const propsFilter = (obj) => {
    return Object.fromEntries(Array.from(Object.entries(obj)).filter(([_, v]) => {
        return !(typeof v == "function" || typeof v == "object");
    }));
};

//
export const isMobile = () => {
    const regex =
        /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return regex.test(navigator.userAgent);
};

//
export const MOC = (element: HTMLElement | null, selector: string): boolean => {
    return (!!element?.matches?.(selector) || !!element?.closest?.(selector));
};

//
export const MOCElement = (element: HTMLElement | null, selector: string): HTMLElement | null => {
    return ((!!element?.matches?.(selector) ? element : null) || element?.closest?.(selector)) as HTMLElement | null;
};

//
export const whenAnyScreenChanges = (cb)=>{
    //
    if ("virtualKeyboard" in navigator) {
        // @ts-ignore
        navigator?.virtualKeyboard?.addEventListener?.(
            "geometrychange",
            cb,
            {passive: true}
        );
    }

    //
    document.documentElement.addEventListener("DOMContentLoaded", cb, {
        passive: true,
    });
    screen.orientation.addEventListener("change", cb, {passive: true});
    matchMedia("(orientation: portrait)").addEventListener("change", cb, {passive: true});
    self.addEventListener("resize", cb, {passive: true});

    //
    window?.visualViewport?.addEventListener?.("scroll", cb);
    window?.visualViewport?.addEventListener?.("resize", cb);

    //
    document.documentElement.addEventListener("fullscreenchange", cb);

    //
    requestAnimationFrame(cb);
}
