/** @format */

class PointerEdge {
    constructor(pointer) {
        this.pointer = pointer;
        this.results = {
            left: false,
            top: false,
            bottom: false,
            right: false,
        };
    }

    get left() {
        const current = Math.abs(this.pointer[0] - 0) < 10;
        return (this.results.left = current);
    }

    get top() {
        const current = Math.abs(this.pointer[1] - 0) < 10;
        return (this.results.top = current);
    }

    get right() {
        const current = Math.abs(this.pointer[0] - window.innerWidth) < 10;
        return (this.results.right = current);
    }

    get bottom() {
        const current = Math.abs(this.pointer[1] - window.innerHeight) < 10;
        return (this.results.bottom = current);
    }
}

//
export const pointerMap = new Map([
    [
        -1,
        {
            id: -1,
            movement: [],
            down: [],
            current: [],
            event: null,

            //
            holding: [],
        },
    ],
]);

//
document.addEventListener(
    "pointerdown",
    ev => {
        //
        const np = {
            id: ev.pointerId,
            event: ev,
            current: [ev.pageX, ev.pageY],
            down: [ev.pageX, ev.pageY],
            movement: [0, 0],
        };

        //
        const exists = pointerMap.has(ev.pointerId) ? pointerMap.get(ev.pointerId) : np;
        // @ts-ignore
        np.movement[0] = np.current[0] - exists.current[0];
        // @ts-ignore
        np.movement[1] = np.current[1] - exists.current[1];

        //
        // @ts-ignore
        if (!exists.holding) {
            // @ts-ignore
            exists.holding = [];
        }

        //
        // @ts-ignore
        exists.holding.map(hm => {
            hm.shifting = [...(hm.modified || hm.shifting)];
        });

        //
        // @ts-ignore
        if (!exists.edges) {
            // @ts-ignore
            exists.edges = new PointerEdge(exists);
        }

        //
        // @ts-ignore
        Object.assign(exists, np);

        //
        if (!pointerMap.has(ev.pointerId)) {
            // @ts-ignore
            pointerMap.set(ev.pointerId, exists);
        }
    },
    { capture: true }
);

//
document.addEventListener(
    "pointermove",
    ev => {
        const np = {
            id: ev.pointerId,
            event: ev,
            current: [ev.pageX, ev.pageY],
            movement: [0, 0],
        };

        //
        const exists = pointerMap.has(ev.pointerId) ? pointerMap.get(ev.pointerId) : np;
        // @ts-ignore
        np.movement[0] = np.current[0] - exists.current[0];
        // @ts-ignore
        np.movement[1] = np.current[1] - exists.current[1];

        //
        // @ts-ignore
        if (!exists.holding) {
            // @ts-ignore
            exists.holding = [];
        }

        //
        // @ts-ignore
        if (exists.holding.length > 0) {
            ev.stopImmediatePropagation();
            ev.stopPropagation();
            ev.preventDefault();
        }

        //
        // @ts-ignore
        if (!exists.edges) {
            // @ts-ignore
            exists.edges = new PointerEdge(exists);
        }

        //
        // @ts-ignore
        Object.assign(exists, np);

        //
        if (!pointerMap.has(ev.pointerId)) {
            // @ts-ignore
            pointerMap.set(ev.pointerId, exists);
        }

        //
        // @ts-ignore
        exists.holding.map(hm => {
            hm.shifting[0] += np.movement[0];
            hm.shifting[1] += np.movement[1];
            hm.modified = [...hm.shifting];

            //
            const nev = new CustomEvent("m-dragging", {
                bubbles: true,
                detail: {
                    pointer: exists,
                    holding: hm,
                },
            });

            const em = hm.element.deref();
            em?.dispatchEvent?.(nev);

            //
            em?.style?.setProperty?.(`--${hm.propertyName || "drag"}-x`, hm.modified[0]);
            em?.style?.setProperty?.(`--${hm.propertyName || "drag"}-y`, hm.modified[1]);
        });

        //
        ["left", "top", "right", "bottom"].map(side => {
            // @ts-ignore
            if (exists.edges.results[side] != exists.edges[side]) {
                const nev = new CustomEvent(
                    // @ts-ignore
                    (exists.edges[side] ? "m-contact-" : "m-leave-") + side,
                    { detail: exists }
                );
                document?.dispatchEvent?.(nev);
            }
        });
    },
    { capture: true }
);

//
export const releasePointer = ev => {
    const exists = pointerMap.get(ev.pointerId);

    //
    if (exists) {
        //
        const preventClick = e => {
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();
        };

        //
        const emt = [preventClick, { once: true }];
        const doc = [preventClick, { once: true, capture: true }];

        //
        if (exists.holding.length > 0) {
            ev.stopImmediatePropagation();
            ev.stopPropagation();
            ev.preventDefault();

            //
            // @ts-ignore
            document.addEventListener("click", ...doc);
            // @ts-ignore
            document.addEventListener("contextmenu", ...doc);

            //
            setTimeout(() => {
                // @ts-ignore
                document.removeEventListener("click", ...doc);
                // @ts-ignore
                document.removeEventListener("contextmenu", ...doc);
            }, 100);
        }

        //
        exists.holding.map(hm => {
            // @ts-ignore
            const em = hm.element.deref();

            //
            // @ts-ignore
            if (Math.hypot(...hm.shifting) > 10 && em) {
                em?.addEventListener?.("click", ...emt);
                em?.addEventListener?.("contextmenu", ...emt);

                //
                setTimeout(() => {
                    em?.removeEventListener?.("click", ...emt);
                    em?.removeEventListener?.("contextmenu", ...emt);
                }, 100);
            }

            //
            const nev = new CustomEvent("m-dragend", {
                bubbles: true,
                detail: {
                    pointer: exists,
                    holding: hm,
                },
            });
            em?.dispatchEvent?.(nev);
        });

        //
        pointerMap.delete(ev.pointerId);
    }
};

//
document.addEventListener("pointercancel", releasePointer, { capture: true });
document.addEventListener("pointerup", releasePointer, { capture: true });

//
export const grabForDrag = (
    element,
    ev = { pointerId: 0 },
    {
        shifting = [0, 0],
        // @ts-ignore
        propertyName = "drag", // use dragging events for use limits
    } = {}
) => {
    const exists = pointerMap.get(ev.pointerId);
    if (exists) {
        // @ts-ignore
        exists.event = ev;

        //
        // @ts-ignore
        const hm = exists.holding.find(hm => hm.element.deref() == element) || {};
        // @ts-ignore
        exists.holding.push(
            // @ts-ignore
            Object.assign(hm, {
                element: new WeakRef(element),
                // @ts-ignore
                shifting: [...(hm?.modified || hm?.shifting || shifting || [])],
            })
        );

        // pls, assign "ev.detail.holding.shifting" to initial value (f.e. "ev.detail.holding.modified")
        // note about "ev.detail.holding.element is WeakRef, so use ".deref()"
        const nev = new CustomEvent("m-dragstart", {
            bubbles: true,
            detail: {
                pointer: exists,
                holding: hm,
            },
        });

        //
        element?.dispatchEvent?.(nev);
    }
};
