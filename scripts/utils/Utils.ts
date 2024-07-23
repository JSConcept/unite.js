//
export const or_mod = {
    "landscape-primary": [1, 1, 1],
    "landscape-secondary": [1, 1, 1],
    "portrait-primary": [1, 1, 0],
    "portrait-secondary": [-1, -1, 0],
};

const zoomSupport = "currentCSSZoom" in document.documentElement;

//
export const zoomOf = () => {
    // @ts-ignore
    if (zoomSupport) { return ((document.documentElement.currentCSSZoom as number) || 1); }
    return parseFloat(document.documentElement.style.getPropertyValue("--scaling")) || 1;
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
const parser = new DOMParser();
export const html = (source, type: DOMParserSupportedType = 'text/html') => {
    const parsed = parser.parseFromString(source, type);
    return parsed.querySelector('template') ?? parsed.querySelector("*");
};

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

//
export const detectMobile = () => {
    return toMatch.some(navigator.userAgent.match.bind(navigator.userAgent)) && (navigator.maxTouchPoints || 'ontouchstart' in document.documentElement) && window.matchMedia("(pointer: coarse)").matches;
};

//
export const provide = async (req: string | Request = "") => {
    const path: string = (req as Request)?.url ?? req;
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
                ?.getDirectoryHandle?.(parts[I], {create: false})
                ?.catch?.(console.warn.bind(console));
            if (!dir) break;
        }

        //
        const fileHandle = await dir?.getFileHandle?.(parts[parts.length - 1], {
            create: false,
        });
        return await fileHandle?.getFile?.();
    } else {
        return fetch(path).then((r) => r.blob());
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
export const MOC = (element: HTMLElement, selector: string): boolean => {
    return (!!element.matches(selector) || !!element.closest(selector));
};

//
export const MOCElement = (element: HTMLElement, selector: string): HTMLElement | null => {
    return ((!!element.matches(selector) ? element : null) || element.closest(selector));
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
    self.addEventListener("resize", cb, {passive: true});

    //
    window?.visualViewport?.addEventListener?.("scroll", cb);
    window?.visualViewport?.addEventListener?.("resize", cb);

    //
    document.documentElement.addEventListener("fullscreenchange", cb);

    //
    requestAnimationFrame(cb);
}
