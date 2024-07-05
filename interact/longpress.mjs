// @ts-nocheck
export const longpress = (node, threshold = 60) => {
    const handle_mousedown = (ev) => {
        const pointerId = ev.pointerId;
        let start = Date.now();
        let begin = [ev.pageX, ev.pageY];

        //
        const timeout = setTimeout(() => {
            node.dispatchEvent(new CustomEvent("long-press", { detail: ev }));
        }, threshold);

        //
        const cancel = (ev) => {
            if (ev?.pointerId == pointerId || ev?.pointerId == null) {
                clearTimeout(timeout);
                document.removeEventListener("pointermove", shifted);
                document.removeEventListener("pointerup", cancel);
            }
        };

        //
        const shifted = (ev) => {
            if (
                pointerId == ev.pointerId && 
                Math.hypot(
                    begin[0] - ev.pageX,
                    begin[1] - ev.pageY
                ) > 10
            ) {
                cancel(ev);
            }
        };

        //
        document.addEventListener('pointermove', shifted);
        document.addEventListener('pointerup', cancel);
        document.addEventListener('pointercancel', cancel);
    }
    
    //
    node.addEventListener('pointerdown', handle_mousedown);
    
    //
    return {
        destroy() {
            node.removeEventListener('pointerdown', handle_mousedown);
        }
    };
}
