import { observeAttributeBySelector } from "../dom/Observer.ts";

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
                "--opacity": target[computed]?.getPropertyValue("--opacity") || "revert-layer",
                "--scale": target[computed]?.getPropertyValue("--scale") || "revert-layer",
                pointerEvents: "none"
            },
            {
                easing: "linear",
                offset: 0.99,

                //
                display: target[computed]?.display || "revert-layer",
                "--opacity": 0,
                "--scale": 0.8,
                pointerEvents: "none"
            },
            {
                easing: "linear",
                offset: 1,

                //
                display: "none",
                "--opacity": 0,
                "--scale": 0.8,
                pointerEvents: "none"
            }
        ],  {
            fill: "none",
            duration: 100,
            easing: "linear",
            delay: matchMedia("(hover: none)").matches ? (parseFloat(target.getAttribute("data-delay-hide") || "0") || 0) : 0
            //rangeStart: "cover 0%",
            //rangeEnd: "cover 100%",
        }).finished;

        //
        target.classList.remove("ux-while-animation");
    }

    //
    target.dispatchEvent(new CustomEvent("ux-hidden", {
        detail: {},
        bubbles: true,
        cancelable: true
    }));
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
                "--opacity": 0,
                "--scale": 0.8,
                pointerEvents: "none"
            },
            {
                easing: "linear",
                offset: 0.01,

                //
                display: target[computed]?.display || "revert-layer",
                "--opacity": 0,
                "--scale": 0.8,
                pointerEvents: "none"
            },
            {
                easing: "linear",
                offset: 1,

                //
                display: target[computed]?.display || "revert-layer",
                "--opacity": target[computed]?.getPropertyValue("--opacity") || "revert-layer",
                "--scale": target[computed]?.getPropertyValue("--scale") || "revert-layer",
                pointerEvents: target[computed]?.pointerEvents || "revert-layer"
            }
        ], {
            fill: "none",
            duration: 100,
            easing: "linear",
            delay: 0
            //rangeStart: "cover 0%",
            //rangeEnd: "cover 100%",
        }).finished;

        //
        target.classList.remove("ux-while-animation");
    }

    //
    target.dispatchEvent(new CustomEvent("ux-appear", {
        detail: {},
        bubbles: true,
        cancelable: true
    }));
}

//
observeAttributeBySelector(document.body, "*[data-hidden]", "data-hidden", (mutation)=>{
    if (mutation.attributeName == 'data-hidden') {
        const target = mutation.target as HTMLElement;
        if (target.dataset.hidden != mutation.oldValue) {
            if ((target.dataset.hidden && target.dataset.hidden != "false")) {
                animateHide(target);
            } else {
                animateShow(target);
            }
        }
    }
});
