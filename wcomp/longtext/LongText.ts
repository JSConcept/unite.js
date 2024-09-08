// @ts-ignore
import styles from "./LongText.scss?inline";

// @ts-ignore
import html from "./LongText.html?raw";
import { doButtonAction, makeInput } from "./Utils.ts";

//
class LongTextElement extends HTMLElement {
    #input?: HTMLInputElement | null;
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
        const whenClick = (ev)=>{
            const button = ev.target as HTMLElement;
            if (button.matches("x-longtext button") && this.contains(button)) {
                ev.preventDefault();
                ev.stopPropagation();
                if (document.activeElement == button) { this.restoreFocus(); };
                if (ev.type == "click") {
                    doButtonAction(button, document.activeElement as HTMLInputElement);
                }
            }
        }

        //
        document.addEventListener("click", whenClick, {capture: true});
        document.addEventListener("pointerdown", whenClick, {capture: true});

        //
        makeInput(this);
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
export default LongTextElement;
customElements.define("x-longtext", LongTextElement);
