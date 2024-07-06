// @ts-nocheck

import { zoomOf } from "../utils/utils";

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
    (ev) => {
        //
        const np = {
            id: ev.pointerId,
            event: ev,
            current: [ev.clientX / zoomOf(), ev.pageY / zoomOf()],
            down: [ev.clientX / zoomOf(), ev.pageY / zoomOf()],
            movement: [0, 0],
        };

        //
        const exists = pointerMap.has(ev.pointerId)
            ? pointerMap.get(ev.pointerId)
            : np;
        np.movement[0] = np.current[0] - exists.current[0];
        np.movement[1] = np.current[1] - exists.current[1];

        //
        if (!exists.holding) {
            exists.holding = [];
        }

        //
        exists.holding.map((hm) => {
            hm.shifting = [...(hm.modified || hm.shifting)];
        });

        //
        if (!exists.edges) {
            exists.edges = new PointerEdge(exists);
        }

        //
        Object.assign(exists, np);

        //
        if (!pointerMap.has(ev.pointerId)) {
            pointerMap.set(ev.pointerId, exists);
        }
    },
    { capture: true }
);

//
document.addEventListener(
    "pointermove",
    (ev) => {
        const np = {
            id: ev.pointerId,
            event: ev,
            current: [ev.clientX / zoomOf(), ev.pageY / zoomOf()],
            movement: [0, 0],
        };

        //
        const exists = pointerMap.has(ev.pointerId)
            ? pointerMap.get(ev.pointerId)
            : np;
        np.movement[0] = np.current[0] - exists.current[0];
        np.movement[1] = np.current[1] - exists.current[1];

        //
        if (!exists.holding) {
            exists.holding = [];
        }

        //
        if (exists.holding.length > 0) {
            ev.stopImmediatePropagation();
            ev.stopPropagation();
            ev.preventDefault();
        }

        //
        if (!exists.edges) {
            exists.edges = new PointerEdge(exists);
        }

        //
        Object.assign(exists, np);

        //
        if (!pointerMap.has(ev.pointerId)) {
            pointerMap.set(ev.pointerId, exists);
        }

        //
        exists.holding.map((hm) => {
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

            //
            const em = hm.element.deref();
            em?.dispatchEvent?.(nev);

            //
            em?.style?.setProperty?.(
                `--${hm.propertyName || "drag"}-x`,
                hm.modified[0]
            );
            em?.style?.setProperty?.(
                `--${hm.propertyName || "drag"}-y`,
                hm.modified[1]
            );
        });

        //
        ["left", "top", "right", "bottom"].map((side) => {
            if (exists.edges.results[side] != exists.edges[side]) {
                const nev = new CustomEvent(
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
export const releasePointer = (ev) => {
    const exists = pointerMap.get(ev.pointerId);

    //
    if (exists) {
        //
        const preventClick = (e) => {
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
            document.addEventListener("click", ...doc);
            document.addEventListener("contextmenu", ...doc);

            //
            setTimeout(() => {
                document.removeEventListener("click", ...doc);
                document.removeEventListener("contextmenu", ...doc);
            }, 100);
        }

        //
        exists.holding.map((hm) => {
            const em = hm.element.deref();

            //
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
        propertyName = "drag", // use dragging events for use limits
    } = {}
) => {
    const exists = pointerMap.get(ev.pointerId);
    if (exists) {
        exists.event = ev;

        //
        const hm =
            exists.holding.find(
                (hm) =>
                    hm.element.deref() == element &&
                    hm.propertyName == propertyName
            ) || {};
        exists.holding.push(
            Object.assign(hm, {
                propertyName,
                element: new WeakRef(element),
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
