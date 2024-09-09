import { observeAttributeBySelector, observeBySelector, observeContentBox } from "@ux-ts/dom/Observer.ts";

// this flex-like supports animations
export class FlexLike extends HTMLDivElement {
    static observedAttributes = ["data-direction"];

    //
    connectedCallback() {
        this.dataset.enableTransition = "false";
        this.#recalculate();
    }

    //
    constructor() {
        super();

        //
        this.style.position = "relative";

        //
        observeAttributeBySelector(document.documentElement, "*[data-hidden]", "data-hidden", (m)=>{
            const has = Array.from(m.target.querySelectorAll("*[is=\"flex-like\"]"));
            if (has.length > 0 && has.some((e)=>(e==this)) && (m.oldValue != m.target.dataset.hidden)) {
                this.dataset.enableTransition = "false";
            }
        });

        // when some-one change 'data-hidden' state
        this.addEventListener("ux-hidden", ()=>{ this.#recalculate(); });
        this.addEventListener("ux-appear", ()=>{ this.#recalculate(); });

        //
        observeBySelector(this, "*", (_)=>{
            this.#recalculate();
        });

        //
        observeContentBox(this, (_)=>{
            this.#recalculate();
        });
    }

    // flex-direction: column
    // TODO: support for wrap
    #recalculate() {
        //await new Promise((r)=>requestAnimationFrame(r));

        //
        const ordered: any[] = [];
        const gap = (this.dataset.gap ? parseFloat(this.dataset.gap) : 0) || 0;

        // @ts-ignore
        for (const child of this.children) { ordered.push(child); }

        //
        let height = 0;
        let width  = 0;
        ordered.sort((a,b)=>{
            return Math.sign((parseInt(a.dataset.order)||0)-(parseInt(b.dataset.order)||0));
        }).forEach((child, I, A)=>{
            child.style.setProperty("--inset-block-start", height + "px");
            height += child.offsetHeight;
            if (I < (A.length-1)) height += gap;
            width = Math.max(width, child.offsetWidth);
        });

        //
        this.style.setProperty("--block-size", height + "px");
        this.dataset.enableTransition = "true";
    }
}

//
customElements.define('flex-like', FlexLike, {extends: 'div'});
