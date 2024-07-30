import {getCorrectOrientation, provide} from "../utils/Utils.ts";

//
const cover = (ctx, img, scale = 1, port) => {
    const orientation = getCorrectOrientation();
    const canvas = ctx.canvas;

    //
    switch (orientation) {
        //
        case "landscape-primary": {
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(0 * (Math.PI / 180));
            ctx.rotate(port * -90 * (Math.PI / 180));
            ctx.translate(-(img.width / 2) * scale, -(img.height / 2) * scale);
        };
        break;

        //
        case "portrait-primary": {
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(90 * (Math.PI / 180));
            ctx.rotate(port * -90 * (Math.PI / 180));
            ctx.translate(-(img.width / 2) * scale, -(img.height / 2) * scale);
        };
        break;

        //
        case "landscape-secondary": {
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(180 * (Math.PI / 180));
            ctx.rotate(port * -90 * (Math.PI / 180));
            ctx.translate(-(img.width / 2) * scale, -(img.height / 2) * scale);
        };
        break;

        //
        case "portrait-secondary": {
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(270 * (Math.PI / 180));
            ctx.rotate(port * -90 * (Math.PI / 180));
            ctx.translate(-(img.width / 2) * scale, -(img.height / 2) * scale);
        };
        break;
    }

};


//
const blobImageMap = new WeakMap();
const createImageBitmapCache = (blob)=>{
    if (!blobImageMap.has(blob)) {
        blobImageMap.set(blob, createImageBitmap(blob));
    }
    return blobImageMap.get(blob);
}


export class WCanvas extends HTMLCanvasElement {
    static observedAttributes = ["data-src"];

    //
    ctx: CanvasRenderingContext2D | null = null;
    image: ImageBitmap | null = null;

    //
    connectedCallback() {
        const parent: HTMLElement = this.parentNode as HTMLElement;
        this.width = Math.max((this.clientWidth || parent?.clientWidth || 0) * devicePixelRatio, 0);
        this.height = Math.max((this.clientHeight || parent?.clientHeight || 0) * devicePixelRatio, 0);
    }

    //
    constructor() {
        super();

        //
        const canvas = this as HTMLCanvasElement;
        const parent = this.parentNode as HTMLElement;

        //
        this.ctx = canvas.getContext("2d", {
            desynchronized: true,
            willReadFrequently: false,
            powerPreference: "high-performance"
        }) as CanvasRenderingContext2D;

        //
        this.inert = true;
        this.style.objectFit = "cover";
        this.style.objectPosition = "center";
        this.classList.add("w-canvas");

        //
        new ResizeObserver((entries) => {
            for (const entry of entries) {
                const contentBox = entry.contentBoxSize[0];
                if (contentBox) {
                    this.width = Math.max(contentBox.inlineSize * devicePixelRatio, 0);
                    this.height = Math.max(contentBox.blockSize * devicePixelRatio, 0);
                    this.#render();
                }
            }
        }).observe(this, {box: "content-box"});

        //
        const fixSize = () => {
            this.width = Math.max((this.clientWidth || parent?.clientWidth || 0) * devicePixelRatio, 0);
            this.height = Math.max((this.clientHeight || parent?.clientHeight || 0) * devicePixelRatio, 0);
            this.#render();
        }

        //
        screen.orientation.addEventListener("change", fixSize);
        window.addEventListener("resize", fixSize);
        requestAnimationFrame(fixSize);

        //
        this.#preload(this.dataset.src).then(() => this.#render());
    }

    //
    #render() {
        const canvas = this;
        const ctx = this.ctx;
        const img = this.image;

        //
        /*if (CSS.supports("background-image", "paint(w-canvas)")) {
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            this.style.backgroundImage = "paint(w-canvas)";
            this.style.backgroundSize = "cover";
            this.style.backgroundPosition = "center";
        } else*/ //{
        if (img && ctx) {
            const orientation = getCorrectOrientation() || "";
            const ox = (orientation.startsWith("portrait") ? 1 : 0) - 0;

            //
            const port = img.width < img.height ? 1 : 0;
            const scale = Math.max(
                canvas[["width", "height"][ox]] / img[["width", "height"][port]],
                canvas[["height", "width"][ox]] / img[["height", "width"][port]]);

            //
            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cover(ctx, img, scale, port);
            ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale);
            ctx.restore();
        }
        //}
    }

    //
    async $useImageAsSource(blob, doNotRewrite = false) {
        const img = (blob instanceof ImageBitmap) ? blob : (await createImageBitmapCache(blob).catch((_) => null));

        //
        if (blob instanceof Blob || blob instanceof File) {
            //this.style.backgroundImage = `url(\"${URL.createObjectURL(blob)}\")`;
            //this.style.setProperty("--image", `url(\"${URL.createObjectURL(blob)}\")`);
            //this.style.setProperty("--image-width", (this.image?.width || 1) as unknown as string);
            //this.style.setProperty("--image-height", (this.image?.height || 1) as unknown as string);
            //this.style.setProperty("border-image-source", `url(\"${URL.createObjectURL(blob)}\")`);

            //
            window.dispatchEvent(new CustomEvent("wallpaper", {detail: {blob, doNotRewrite}}));
        }

        //
        if (img) {this.image = img; this.#render();}

        //
        return blob;
    }

    //
    #preload(src) {
        return provide(src).then(async (blob: any) => {
            return (await this.$useImageAsSource(blob).catch((_) => null));
        }).catch(console.warn.bind(console));
    }

    //
    attributeChangedCallback(name, _, newValue) {
        if (name == "data-src") {
            this.#preload(newValue).then(() => this.#render());
        };
    }
}

//
customElements.define('w-canvas', WCanvas, {extends: 'canvas'});

//
/* // broken support...
if ("paintWorklet" in CSS) {
    // @ts-ignore
    CSS.paintWorklet.addModule(new URL("./WCanvasPaint.mjs", import.meta.url).href);
}

//
CSS?.registerProperty?.({
    name: '--image-width',
    syntax: '<number>',
    initialValue: `1`,
    inherits: true,
});

//
CSS?.registerProperty?.({
    name: '--image-height',
    syntax: '<number>',
    initialValue: `1`,
    inherits: true,
});

//
CSS?.registerProperty?.({
    name: '--image',
    syntax: '<image>',
    initialValue: `url(\"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\")`,
    inherits: true,
});
*/