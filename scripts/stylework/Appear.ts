import { observeBySelector, observeAttributeBySelector } from "../dom/Observer.ts";

//
const computed = Symbol("@computed");
const animateHide = async (target)=>{
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches && !target.classList.contains("ux-while-animation") && !target.hasAttribute("data-instant")) {
        target.classList.add("ux-while-animation");
    }

    //
    if (target.classList.contains("ux-while-animation")) {
        //target[computed] = getComputedStyle(target, "");
        await target.animate([
            {
                easing: "linear",
                offset: 0,

                //
                display: target[computed]?.display || "revert-layer",
                opacity: target[computed]?.opacity || "revert-layer",
                scale: target[computed]?.scale || "revert-layer",
                pointerEvents: "none"
            },
            {
                easing: "linear",
                offset: 0.99,

                //
                display: target[computed]?.display || "revert-layer",
                opacity: 0,
                scale: 0.8,
                pointerEvents: "none"
            },
            {
                easing: "linear",
                offset: 1,

                //
                display: "none",
                opacity: 0,
                scale: 0.8,
                pointerEvents: "none"
            }
        ],  {
            fill: "none",
            duration: 100,
            rangeStart: "cover 0%",
            rangeEnd: "cover 100%",
        }).finished;

        //
        target.classList.remove("ux-while-animation");
    }
}

//
const animateShow = async (target)=>{
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches && !target.classList.contains("ux-while-animation") && !target.hasAttribute("data-instant")) {
        target.classList.add("ux-while-animation");
    }

    //
    if (target.classList.contains("ux-while-animation")) {
        await target.animate([
            {
                easing: "linear",
                offset: 0,

                //
                display: "none",
                opacity: 0,
                scale: 0.8,
                pointerEvents: "none"
            },
            {
                easing: "linear",
                offset: 0.01,

                //
                display: target[computed]?.display || "revert-layer",
                opacity: 0,
                scale: 0.8,
                pointerEvents: "none"
            },
            {
                easing: "linear",
                offset: 1,

                //
                display: target[computed]?.display || "revert-layer",
                opacity: target[computed]?.opacity || "revert-layer",
                scale: target[computed]?.scale || "revert-layer",
                pointerEvents: target[computed]?.pointerEvents || "revert-layer"
            }
        ], {
            fill: "none",
            duration: 100,
            rangeStart: "cover 0%",
            rangeEnd: "cover 100%",
        }).finished;

        //
        target.classList.remove("ux-while-animation");
    }
}

//
const observed = new WeakSet();
/*const observer = new MutationObserver((mutations)=>{
    mutations.forEach((mutation)=>{
        
    });
});*/

//
const observer = observeAttributeBySelector(document.body, "data-hidden", "*[data-hidden]", (mutation)=>{
    //
    /*addedNodes.forEach((node)=>{
        if (!observed.has(node)) {
            observer.observe(node, { attributes: true, attributeOldValue : true });
            observed.add(node);
        }
    });*/
    if (mutation.attributeName == 'data-hidden') {
        const target = mutation.target as HTMLElement;

        //
        if (target.dataset.hidden != mutation.oldValue) {
            if ((target.dataset.hidden && target.dataset.hidden != "false")) {
                animateHide(target);
            } else {
                animateShow(target);
            }
        }
    }

});