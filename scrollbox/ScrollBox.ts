//
import {zoomOf} from "../utils/Utils.ts";

// @ts-ignore
import styles from "./ScrollBox.scss?inline";

//
import html from "./ScrollBox.html?raw";

//
import {observeContentBox} from "../dom/Observer.ts";

//
interface ScrollBarStatus {
    pointerId: number;
    virtualScroll: number;
    pointerLocation: number;
}

//
const contentBoxWidth = Symbol("@content-box-width");
const contentBoxHeight = Symbol("@content-box-height");

//
class ScrollBar {
    scrollbar: HTMLDivElement;
    holder: HTMLElement;
    status: ScrollBarStatus;

    //
    constructor({holder, scrollbar}, axis = 0) {
        this.scrollbar = scrollbar;
        this.holder = holder;

        //
        this.status = {
            pointerLocation: 0,
            virtualScroll: 0,
            pointerId: -1,
        };

        //
        const onChanges = () => {

            const sizePercent = Math.min(
                this.holder[[contentBoxWidth, contentBoxHeight][axis]] /
                this.holder[["scrollWidth", "scrollHeight"][axis]],
                1
            );
            const thumbSize = this.holder[[contentBoxWidth, contentBoxHeight][axis]] * sizePercent;

            //
            const scrollAvailable =
                this.holder[[contentBoxWidth, contentBoxHeight][axis]] -
                thumbSize;

            //
            this.scrollbar.style.setProperty("--thumbSize", (thumbSize || "0") as string, "");
            this.scrollbar.style.setProperty("--scrollAvail", (scrollAvailable || "0") as string, "");

            //
            this.holder.style.setProperty(
                "--scroll-top",
                (this.holder.scrollTop || "0") as string,
                ""
            );
            this.holder.style.setProperty(
                "--scroll-left",
                (this.holder.scrollLeft || "0") as string,
                ""
            );

            //
            const event = new CustomEvent("scroll-change", {
                detail: {
                    scrollTop: this.holder.scrollTop,
                    scrollLeft: this.holder.scrollLeft,
                },
            });

            //
            this.holder.dispatchEvent(event);

            //
            if (sizePercent >= 0.999) {
                this.scrollbar.style.setProperty("visibility", "collapse", "");
            } else {
                this.scrollbar.style.setProperty("visibility", "visible", "");
            }
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
                        this.holder[["scrollLeft", "scrollTop"][axis]];
                }
            });

        //
        document.documentElement.addEventListener("pointermove", (ev) => {
            if (ev.pointerId == this.status.pointerId) {
                ev.stopPropagation();

                //
                const previous = this.holder[["scrollLeft", "scrollTop"][axis]];
                const coord = ev[["clientX", "clientY"][axis]] / zoomOf();

                //
                this.status.virtualScroll +=
                    (coord - this.status.pointerLocation) *
                    (this.holder[["scrollWidth", "scrollHeight"][axis]] / this.holder[[contentBoxWidth, contentBoxHeight][axis]]);
                this.status.pointerLocation = coord;

                //
                const realShift = this.status.virtualScroll - previous;

                //
                this.holder.scrollBy({
                    [["left", "top"][axis]]: realShift,
                    behavior: "instant",
                });
            }
        });

        //
        const stopScroll = (ev) => {
            if (this.status.pointerId == ev.pointerId) {
                this.status.virtualScroll =
                    this.holder[["scrollLeft", "scrollTop"][axis]];
                this.status.pointerId = -1;
                onChanges();
            }
        };

        //
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
        this.holder.addEventListener("scroll", onChanges);

        //
        observeContentBox(this.holder, (box) => {
            this.holder[contentBoxWidth] = box.inlineSize;
            this.holder[contentBoxHeight] = box.blockSize;
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
                scrollbar: shadowRoot.querySelector(".scrollbar-x"),
            },
            0
        );

        //
        this["@scrollbar-y"] = new ScrollBar(
            {
                holder: this,
                scrollbar: shadowRoot.querySelector(".scrollbar-y"),
            },
            1
        );

        //
        if (this.dataset.scrollTop || this.dataset.scrollLeft) {
            this.scrollTo({
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
        if (name == this.dataset.scrollTop) {
            this.scrollTo({
                top: parseFloat(this.dataset.scrollTop || "0") || 0,
                left: this.scrollLeft || 0,
                behavior: "instant",
            });

            //
            const event = new CustomEvent("scroll-set", {
                detail: {
                    scrollTop: parseFloat(this.dataset.scrollTop || "0") || 0,
                    scrollLeft: parseFloat(this.dataset.scrollLeft || "0") || 0,
                },
            });

            //
            this.dispatchEvent(event);
        }

        //
        if (name == this.dataset.scrollLeft) {
            this.scrollTo({
                top: this.scrollTop || 0,
                left: parseFloat(this.dataset.scrollLeft || "0") || 0,
                behavior: "instant",
            });

            //
            const event = new CustomEvent("scroll-set", {
                detail: {
                    scrollTop: parseFloat(this.dataset.scrollTop || "0") || 0,
                    scrollLeft: parseFloat(this.dataset.scrollLeft || "0") || 0,
                },
            });

            //
            this.dispatchEvent(event);
        }
    }
}

//
customElements.define("x-scrollbox", ScrollBox);
