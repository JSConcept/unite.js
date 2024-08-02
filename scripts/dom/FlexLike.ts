import { observeBySelector, observeContentBox } from "../dom/Observer.ts";

// this flex-like supports animations
export class FlexLike extends HTMLDivElement {
    static observedAttributes = ["data-direction"];

    //
    connectedCallback() {
        this.#recalculate();
    }

    //
    constructor() {
        super();

        //
        this.style.position = "relative";

        //
        observeBySelector(this, "*", (_)=>{
            this.#recalculate();
        });

        //
        observeContentBox(this, (_)=>{
            this.#recalculate();
        });

        //
        this.#recalculate();
    }

    // flex-direction: column
    // TODO: support for wrap
    #recalculate() {
        //
        const ordered: any[] = [];

        // @ts-ignore
        for (const child of this.children) { ordered.push(child); }

        //
        let height = 0;
        let width  = 0;
        ordered.sort((a,b)=>{
            return Math.sign((a.dataset.order||0)-(b.dataset.order||0));
        }).forEach((child)=>{
            child.style.setProperty("--inset-block-start", height + "px");
            height += child.offsetHeight;
            width = Math.max(width, child.offsetWidth);
        });

        //
        this.style.setProperty("--block-size", height + "px");
    }

    //
    attributeChangedCallback(name, _, newValue) {

    }
}

//
customElements.define('flex-like', FlexLike, {extends: 'div'});
