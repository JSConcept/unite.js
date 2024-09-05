//
import {zoomOf} from "../../scripts/utils/Zoom.ts";
import {observeBorderBox} from "../../scripts/dom/Observer.ts";

// @ts-ignore
import styles from "./ScrollBox.scss?inline";
import html from "./ScrollBox.html?raw";
import Timer from "../../scripts/performance/Time.ts";
import { UUIDv4 } from "../../scripts/crypto/aes-gcm.ts";



//
const delayed = new Map<string, Function | null>([]);
Timer.rafLoop(()=>{
    for (const dl of delayed.entries()) {
        dl[1]?.();
        delayed.delete(dl[0]);
    }
});

//
const callByFrame = (pointerId, cb)=>{
    delayed.set(pointerId, cb);
}


//
export interface ScrollBarStatus {
    pointerId: number;
    virtualScroll: number;
    pointerLocation: number;
}

//
const setProperty = (target, name, value, importance = "")=>{
    if ("attributeStyleMap" in target) {
        const raw = target.attributeStyleMap.get(name);
        const prop = raw?.[0] ?? raw?.value;
        if (parseFloat(prop) != value && prop != value || prop == null) {
            target.attributeStyleMap.set(name, value);
        }
    } else {
        const prop = target?.style?.getPropertyValue?.(name);
        if (parseFloat(prop) != value && prop != value || prop == null) {
            target?.style?.setProperty?.(name, value, importance);
        }
    }
}

//
const borderBoxWidth  = Symbol("@content-box-width");
const borderBoxHeight = Symbol("@content-box-height");

//
class ScrollBar {
    scrollbar: HTMLDivElement;
    holder: HTMLElement;
    status: ScrollBarStatus;
    content: HTMLDivElement;
    uuid: string = "";
    uuid2: string = "";
    uuid3: string = "";

    //
    constructor({holder, scrollbar, content}, axis = 0) {
        this.scrollbar = scrollbar;
        this.holder    = holder;
        this.content   = content;
        this.uuid      = UUIDv4();
        this.uuid2     = UUIDv4();
        this.uuid3     = UUIDv4();

        //
        this.status = {
            pointerLocation: 0,
            virtualScroll: 0,
            pointerId: -1,
        };

        //
        const onChanges = (ev: any | null = null) => {
            //if (!ev?.target || ev?.target == this.content) {

                callByFrame(this.uuid, ()=>{
                    const sizePercent = Math.min(
                        this.content[[borderBoxWidth, borderBoxHeight][axis]] /
                        this.content[["scrollWidth", "scrollHeight"][axis]],
                        1
                    );

                    //
                    setProperty(this.scrollbar, "--sizeCoef", sizePercent);
                    if (sizePercent >= 0.999) {
                        setProperty(this.scrollbar, "visibility", "collapse", "important");
                    } else {
                        setProperty(this.scrollbar, "visibility", "visible", "important");
                    }
                });
            //}
        };

        //
        this.scrollbar
            ?.querySelector?.(".thumb")
            ?.addEventListener?.("pointerdown", (ev) => {
                if (this.status.pointerId < 0) {
                    this.status.pointerId = ev.pointerId;
                    this.status.pointerLocation =
                        ev[["clientX", "clientY"][axis]] / zoomOf();
                    this.status.virtualScroll =
                        this.content[["scrollLeft", "scrollTop"][axis]];
                }
            });

        //
        document.documentElement.addEventListener("pointermove", (ev) => {
            if (ev.pointerId == this.status.pointerId) {
                ev.stopPropagation();

                //
                //callByFrame(this.uuid2, ()=>{
                    const previous = this.content[["scrollLeft", "scrollTop"][axis]];
                    const coord = ev[["clientX", "clientY"][axis]] / zoomOf();

                    //
                    this.status.virtualScroll +=
                        (coord - this.status.pointerLocation) *
                        (this.content[["scrollWidth", "scrollHeight"][axis]] / this.content[[borderBoxWidth, borderBoxHeight][axis]]);
                    this.status.pointerLocation = coord;

                    //
                    const realShift = this.status.virtualScroll - previous;

                    //
                    if (Math.abs(realShift) >= 0.001) {
                        this.content.scrollBy({
                            [["left", "top"][axis]]: realShift,
                            behavior: "instant",
                        });
                    }
                //});
            }
        });

        //
        const stopScroll = (ev) => {
            if (this.status.pointerId == ev.pointerId) {
                this.status.virtualScroll =
                    this.content[["scrollLeft", "scrollTop"][axis]];
                this.status.pointerId = -1;
                onChanges();
            }
        };

        //
        document.documentElement.addEventListener("scaling", onChanges);
        document.documentElement.addEventListener("click", onChanges);
        document.documentElement.addEventListener("pointerup", stopScroll, {});
        document.documentElement.addEventListener(
            "pointercancel",
            stopScroll,
            {}
        );

        //
        this.holder.addEventListener("pointerleave", onChanges);
        this.holder.addEventListener("pointerenter", onChanges);
        this.content.addEventListener("scroll", (ev)=>{
            callByFrame(this.uuid, ()=>{
                //
                if (!CSS.supports("timeline-scope", "--tm-x, --tm-y")) {
                    setProperty(
                        this.holder,
                        "--scroll-top",
                        (this.content.scrollTop || "0") as string
                    );

                    //
                    setProperty(
                        this.holder,
                        "--scroll-left",
                        (this.content.scrollLeft || "0") as string
                    );
                }

                //
                const event = new CustomEvent("scroll-change", {
                    detail: {
                        scrollTop: this.content.scrollTop,
                        scrollLeft: this.content.scrollLeft,
                    },
                });

                //
                this.holder.dispatchEvent(event);
            });
        });

        //
        observeBorderBox(this.content, (box) => {
            this.content[borderBoxWidth] = box.inlineSize;
            this.content[borderBoxHeight] = box.blockSize;
            onChanges();
        });

        //
        addEventListener("resize", onChanges);
        requestAnimationFrame(onChanges);
    }
}

//
CSS?.registerProperty?.({
    name: "--percent",
    syntax: "<number>",
    inherits: true,
    initialValue: "0",
});

//
class ScrollBox extends HTMLElement {
    static observedAttributes = ["data-scroll-top", "data-scroll-left"];

    //
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: "open"});
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, "text/html");
        const content = shadowRoot.querySelector(".content-box");

        //
        dom.querySelector("template")?.content?.childNodes.forEach(cp => {
            shadowRoot.appendChild(cp.cloneNode(true));
        });

        //
        const style = document.createElement("style");
        style.innerHTML = styles;
        shadowRoot.appendChild(style);

        //
        this["@scrollbar-x"] = new ScrollBar(
            {
                holder: this,
                content: shadowRoot.querySelector(".content-box"),
                scrollbar: shadowRoot.querySelector(".scrollbar-x"),
            },
            0
        );

        //
        this["@scrollbar-y"] = new ScrollBar(
            {
                holder: this,
                content: shadowRoot.querySelector(".content-box"),
                scrollbar: shadowRoot.querySelector(".scrollbar-y"),
            },
            1
        );

        //
        if (this.dataset.scrollTop || this.dataset.scrollLeft) {
            content?.scrollTo({
                top: parseFloat(this.dataset.scrollTop || "0") || 0,
                left: parseFloat(this.dataset.scrollLeft || "0") || 0,
                behavior: "instant",
            });

            //
            const event = new CustomEvent("scroll-set", {
                detail: {
                    scrollTop: this.dataset.scrollTop || 0,
                    scrollLeft: this.dataset.scrollLeft || 0,
                },
            });

            //
            this.dispatchEvent(event);
        }
    }

    //
    attributeChangedCallback(name/*, oldValue, newValue*/) {
        //
        const content = this.shadowRoot?.querySelector(".content-box") as HTMLElement;

        //
        if (name == this?.dataset.scrollTop) {
            content?.scrollTo({
                top: parseFloat(this?.dataset.scrollTop || "0") || 0,
                left: content?.scrollLeft || 0,
                behavior: "instant",
            });

            //
            const event = new CustomEvent("scroll-set", {
                detail: {
                    scrollTop: parseFloat(this?.dataset.scrollTop || "0") || 0,
                    scrollLeft: parseFloat(this?.dataset.scrollLeft || "0") || 0,
                },
            });

            //
            this.dispatchEvent(event);
        }

        //
        if (name == this?.dataset.scrollLeft) {
            content?.scrollTo({
                top: this.scrollTop || 0,
                left: parseFloat(this?.dataset.scrollLeft || "0") || 0,
                behavior: "instant",
            });

            //
            const event = new CustomEvent("scroll-set", {
                detail: {
                    scrollTop: parseFloat(this?.dataset.scrollTop || "0") || 0,
                    scrollLeft: parseFloat(this?.dataset.scrollLeft || "0") || 0,
                },
            });

            //
            this.dispatchEvent(event);
        }
    }
}

//
customElements.define("x-scrollbox", ScrollBox);
