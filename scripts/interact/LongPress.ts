import {zoomOf} from "../utils/Zoom.ts";

//
export const longPress = (node, threshold = 60) => {
    const handle_mousedown = (ev) => {
        if (ev.target == node) {
            const pointerId = ev.pointerId;
            //let start = Date.now();
            let begin = [ev.clientX, ev.clientY];

            //
            const timeout = setTimeout(() => {
                node.dispatchEvent(
                    new CustomEvent("long-press", {detail: ev})
                );
            }, threshold);

            //
            const cancel = (ev) => {
                if (ev?.pointerId == pointerId || ev?.pointerId == null) {
                    clearTimeout(timeout);
                    document.documentElement.removeEventListener(
                        "pointermove",
                        shifted
                    );
                    document.documentElement.removeEventListener(
                        "pointerup",
                        cancel
                    );
                }
            };

            //
            const shifted = (ev) => {
                if (
                    ev.pointerId == pointerId &&
                    Math.hypot(
                        begin[0] - ev.clientX,
                        begin[1] - ev.clientY
                    ) > 10
                ) {
                    cancel(ev);
                }
            };

            //
            document.documentElement.addEventListener("pointermove", shifted);
            document.documentElement.addEventListener("pointerup", cancel);
            document.documentElement.addEventListener("pointercancel", cancel);
        }
    };

    //
    document.documentElement.addEventListener("pointerdown", handle_mousedown);

    //
    return {
        destroy() {
            document.documentElement.removeEventListener(
                "pointerdown",
                handle_mousedown
            );
        },
    };
};
