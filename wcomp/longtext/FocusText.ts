// @ts-ignore
import styles from "./LongText.scss?inline";

// @ts-ignore
import html from "./FocusText.html?raw";
import { doButtonAction, makeInput } from "./Utils.ts";
import { computeCaretPositionFromClient, measureInputInFocus } from "./Measure.ts";



//
const getCaret = (point: [number, number])=>{
    let range;
    let node;
    let offset;

    //
    if (document?.caretPositionFromPoint) {
        range = document?.caretPositionFromPoint?.(...point);
        node = range.offsetNode;
        offset = range.offset;
    } else if (document?.caretRangeFromPoint) {
      // Use WebKit-proprietary fallback method
        range = document?.caretRangeFromPoint?.(...point);
        node = range.startContainer;
        offset = range.startOffset;
    }

    //
    return {
        range,
        node,
        offset
    }
}

//
class FocusTextElement extends HTMLElement {
    #input?: HTMLInputElement | null;
    #focus?: HTMLInputElement | null;
    #selectionRange: [number, number] = [0, 0];

    //
    constructor() {
        super();

        //
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, "text/html");

        //
        dom.querySelector("template")?.content?.childNodes.forEach(cp => {
            this.appendChild(cp.cloneNode(true));
        });

        //
        const style = document.createElement("style");
        style.innerHTML = styles;
        this.appendChild(style);

        //
        this.#selectionRange = [0, 0];
        this.#focus = null;
        this.#input = this.querySelector("input");

        //
        this.#input?.addEventListener("change", (ev)=>{
            if (!CSS.supports("field-sizing", "content")) {
                ev.target?.style?.setProperty("inline-size", (ev.target?.value||"").length + "ch");
            }
        });

        //
        this.#input?.addEventListener("input", (ev)=>{
            if (!CSS.supports("field-sizing", "content")) {
                ev.target?.style?.setProperty("inline-size", (ev.target?.value||"").length + "ch");
            }
        });

        //
        if (!CSS.supports("field-sizing", "content")) {
            this.#input?.style?.setProperty("inline-size", (this.#input?.value||"").length + "ch");
        }

        //
        this.#input?.addEventListener("change", (ev)=>{ this.reflectInput(); });
        this.#input?.addEventListener("input", (ev)=>{ this.reflectInput(); });
        this.#input?.addEventListener("blur", (ev)=>{
            this.#selectionRange[0] = (ev.target as HTMLInputElement)?.selectionStart || 0;
            this.#selectionRange[1] = (ev.target as HTMLInputElement)?.selectionEnd   || this.#selectionRange[0];
        });

        //
        this.style.setProperty("display", "none");

        //
        this.#input?.addEventListener("focus", (ev)=>{
            requestAnimationFrame(()=>{
                this.#focus?.setAttribute?.("disabled", "");
                this.style.removeProperty("display");
            });
        });

        //
        this.#input?.addEventListener("blur", (ev)=>{
            requestAnimationFrame(()=>{
                this.#focus?.removeAttribute?.("disabled");

                //
                if (document.activeElement != this.#input) {
                    this.style.setProperty("display", "none");
                }
            });
        });

        //
        makeInput(this);
    }

    //
    reflectInput(where?: HTMLInputElement | null) {
        if ((where ??= this.#focus) && where != this.#input) {
            const newVal = this.#input?.value ?? where.value;
            if (newVal != where.value) { where.value = newVal; };
        }
    }

    //
    setVirtualFocus(where, onClick = false) {
        //
        if (document.activeElement != this.#input) {
            this.style.removeProperty("display");
        }

        //
        if (this.#input && where != this.#input && (this.#focus = where)) {
            const oldValue                = this.#input.value  || "";
            const newVal                  = this.#focus?.value || "";
            const range: [number, number] = [this.#focus?.selectionStart ?? this.#input?.selectionStart ?? 0, this.#focus?.selectionEnd ?? this.#input?.selectionEnd ?? 0];
            const oldActive               = document.activeElement;

            //
            //requestAnimationFrame(()=>{
                if (oldActive != this.#input) {
                    this.#input?.focus?.();
                };

                //
                if (this.#input && this.#focus) {
                    if (newVal != oldValue) { this.#input.value = newVal; };
                    if ((oldValue != newVal || onClick) && this.#input != this.#focus) {
                        if (!(range[0] == range[1] && (!range[1] || ((range[0]||range[1]||0) >= (this.#focus.value.length-1))))) {
                            this.#input?.setSelectionRange?.(...range);
                        }
                    }
                }

                //
                if (onClick) {
                    const sl  = measureInputInFocus(this.#input);
                    const box = this?.querySelector(".ux-input-box");
                    box?.scrollTo?.({
                        left: (sl?.width ?? box?.scrollLeft ?? 0) - 64,
                        top: box?.scrollTop ?? 0,
                        behavior: "smooth"
                    });
                }
            //});
        }
    }

    //
    restoreFocus() {
        if (document.activeElement != this.#input) {
            this.#input?.setSelectionRange?.(...(this.#selectionRange || [0, 0]));
            this.#input?.focus?.();
        }
    }
}

//
export default FocusTextElement;
customElements.define("x-focustext", FocusTextElement);



//
export const MOC = (element: HTMLElement | null, selector: string): boolean => {
    return (!!element?.matches?.(selector) || !!element?.closest?.(selector));
};

//
const enforceFocus = (ev)=>{
    let element = ev?.target as HTMLInputElement;
    if (MOC(element, "input[type=\"text\"], x-focustext, x-longtext") && !element.matches("input[type=\"text\"]")) {
        element = element?.querySelector?.("input[type=\"text\"]") ?? element;
    }

    //
    //if (matchMedia("(hover: none) and (pointer: coarse)").matches)
    {
        const dedicated = (document.querySelector("x-focustext") as FocusTextElement);
        const dInput = dedicated?.querySelector?.("input");
        if (element?.matches?.("input[type=\"text\"]") && !element?.closest?.("x-focustext")) {

            //
            if (ev && ev?.type == "pointerdown" && dInput) {
                const cps = computeCaretPositionFromClient(element, [ev?.clientX, ev?.clientY]);
                dInput?.setSelectionRange(cps, cps);
            }

            //
            dedicated?.setVirtualFocus?.(element, ev.type == "click" || ev.type == "pointerdown");

            //
            ev?.preventDefault?.();
            ev?.stopPropagation?.();
        }
    }
};

//
document.addEventListener("focusin", (ev)=>{
    const input = ev?.target as HTMLElement;
    if (input?.matches("input[type=\"text\"]") && !input?.closest?.("x-focustext") && input instanceof HTMLInputElement) {
        requestAnimationFrame(()=>{
            if (document.activeElement == input) { enforceFocus(ev); }
        });
    }
});

//
const whenClick = (ev)=>{
    const button = ev.target as HTMLElement;
    const dedicated = (document.querySelector("x-focustext") as FocusTextElement);

    //
    enforceFocus(ev);

    //
    if (button.matches("x-focustext button") && dedicated.contains(button)) {
        ev.preventDefault();
        ev.stopPropagation();
        if (document.activeElement == button) { dedicated.restoreFocus(); };
        if (ev.type == "click") {
            doButtonAction(button, document.activeElement as HTMLInputElement);
        }
    }
}

//
document.documentElement.addEventListener("click", whenClick);
document.documentElement.addEventListener("pointerdown", whenClick);

//
document.addEventListener("select", enforceFocus);
document.addEventListener("selectionchange", enforceFocus);
document.addEventListener("selectstart", enforceFocus);

