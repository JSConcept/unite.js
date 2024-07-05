// @ts-nocheck

//
const provide = async (path = "") => {
    path = path?.url ?? path;
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
                ?.getDirectoryHandle?.(parts[I], { create: false })
                ?.catch?.(console.warn.bind(console));
            if (!dir) break;
        }

        //
        const fileh = await dir?.getFileHandle?.(parts[parts.length - 1], {
            create: false,
        });
        return await fileh?.getFile?.();
    } else {
        return fetch(path).then((r) => r.blob());
    }
    return null;
};

//
const getCorrectOrientation = ()=>{
    let orientationType = screen.orientation.type;
    if (!window.matchMedia("((display-mode: fullscreen) or (display-mode: standalone) or (display-mode: window-controls-overlay))").matches) {
        if (matchMedia("(orientation: portrait)" ).matches) { orientationType = orientationType.replace("landscape", "portrait"); } else
        if (matchMedia("(orientation: landscape)").matches) { orientationType = orientationType.replace("portrait", "landscape"); };
    }
    return orientationType;
}

//
const cover = (ctx, img, scale = 1, port) => {
    const orientation = getCorrectOrientation();
    const canvas = ctx.canvas;

    //
    switch(orientation) {
        //
        case "landscape-primary": {
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(0 * (Math.PI/180));
            ctx.rotate(port * -90 * (Math.PI/180));
            ctx.translate(-(img.width / 2) * scale, -(img.height / 2) * scale);
        }
        break;
        
        //
        case "portrait-primary": {
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(90 * (Math.PI/180));
            ctx.rotate(port * -90 * (Math.PI/180));
            ctx.translate(-(img.width / 2) * scale, -(img.height / 2) * scale);
        }
        break;
        
        //
        case "landscape-secondary": {
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(180 * (Math.PI/180));
            ctx.rotate(port * -90 * (Math.PI/180));
            ctx.translate(-(img.width / 2) * scale, -(img.height / 2) * scale);
        }
        break;
        
        //
        case "portrait-secondary": {
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(270 * (Math.PI/180));
            ctx.rotate(port * -90 * (Math.PI/180));
            ctx.translate(-(img.width / 2) * scale, -(img.height / 2) * scale);
        }
        break;
    }
    
}

//
class WCanvas extends HTMLCanvasElement {
    static observedAttributes = ["data-src"];

    //
    connectedCallback() {
        const parent = this.parentNode;
        this.width  = Math.max((this.offsetWidth  || parent?.offsetWidth  || 0) * devicePixelRatio, 0);
        this.height = Math.max((this.offsetHeight || parent?.offsetHeight || 0) * devicePixelRatio, 0);
    }

    //
    constructor() {
        super();

        //
        const canvas = this;
        const parent = this.parentNode;
        
        //
        this.ctx = canvas.getContext("2d", {
            desynchronized: true,
            willReadFrequently: false,
            powerPreference: "high-performance"
        });

        //
        this.inert  = true;
        this.width  = Math.max((this.offsetWidth  || parent?.offsetWidth  || 0) * devicePixelRatio, 0);
        this.height = Math.max((this.offsetHeight || parent?.offsetHeight || 0) * devicePixelRatio, 0);

        //
        this.style.objectFit = "cover";
        this.style.objectPosition = "center";
        this.classList.add("w-canvas");

        //
        new ResizeObserver((entries)=>{
            for (const entry of entries) {
                const contentBox = entry.contentBoxSize[0];
                if (contentBox) {
                    this.width  = Math.max(contentBox.inlineSize * devicePixelRatio, 0);
                    this.height = Math.max(contentBox.blockSize  * devicePixelRatio, 0);
                    this.#render();
                }
            }
        }).observe(this, {box: "content-box"});

        //
        screen.orientation.addEventListener("change", () => {
            this.#render();
        });
        
        //
        window.addEventListener("resize", ()=>{
            this.#render();
        });

        //
        this.#preload(this.dataset.src).then(()=>this.#render());
    }

    //
    #render() {
        const canvas = this;
        const ctx = this.ctx;
        const img = this.image;

        //
        if (img) {
            const orientation = getCorrectOrientation();
            const ox = orientation.startsWith("portrait") - 0;
            
            //
            const port = img.width < img.height ? 1 : 0;
            const scale = Math.max(
                canvas[["width","height"][ox]] / img[["width","height"][port]], 
                canvas[["height","width"][ox]] / img[["height","width"][port]]);
            
            // TODO: support portrait images
            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cover(ctx, img, scale, port);
            ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale);
            ctx.restore();
        }
        
    }

    //
    async $useImageAsSource(blob) {
        const img = (blob instanceof ImageBitmap) ? blob : (await createImageBitmap(blob).catch((_)=>null));
        if (blob instanceof Blob || blob instanceof File) {
            if (img) this.image = img; this.#render();
            window.dispatchEvent(new CustomEvent("wallpaper", { detail: { blob }}));
        }
        return img;
    }

    //
    #preload(src) {
        return provide(src).then(async (blob)=>{
            const img  = await this.$useImageAsSource(blob).catch((_)=>null);
            if (img) { this.image = img; }
        }).catch(console.warn.bind(console));
    }

    //
    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "data-src") {
            this.#preload(newValue).then(()=>this.#render());
        };
    }
}

//
customElements.define('w-canvas', WCanvas, {extends: 'canvas'});
