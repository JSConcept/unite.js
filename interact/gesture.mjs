/** @format */

// @ts-ignore
import Timer from "./axTime.mjs";
// @ts-ignore

import { grabForDrag } from "./pointer-api.mjs";

//
const clamp = (min, val, max) => {
    return Math.max(min, Math.min(val, max));
};

//
// @ts-ignore
const tpm = (callback = (p0, p1) => {}, timeout = 1000) => {
    return new Promise((resolve, reject) => {
        // Set up the timeout
        const timer = setTimeout(() => {
            reject(new Error(`Promise timed out after ${timeout} ms`));
        }, timeout);

        // Set up the real work
        callback(
            value => {
                clearTimeout(timer);
                resolve(value);
            },
            error => {
                clearTimeout(timer);
                reject(error);
            }
        );
    });
};

export default class AxGesture {
    #holder = null;
    // @ts-ignore
    #getSizeDiff = (holder, container, holder, container) => {};
    #dragStatus = {};
    #resizeStatus = {};

    //
    constructor(holder) {
        this.#holder = holder;
        this.#getSizeDiff = Timer.cached((holder, container, shifting = [0, 0]) => {
            const widthDiff = container.offsetWidth - (holder.clientWidth - shifting[0]);
            const heightDiff = container.offsetHeight - (holder.clientHeight - shifting[1]);
            return [widthDiff, heightDiff];
        }, 100);
    }

    //
    swipe(options) {
        if (options?.handler) {
            //
            const swipes = new Map([]);

            //
            options?.handler?.addEventListener("pointerdown", ev => {
                if (ev.target == options?.handler) {
                    swipes.set(ev.pointerId, {
                        target: ev.target,
                        start: [ev.pageX, ev.pageY],
                        current: [ev.pageX, ev.pageY],
                        pointerId: ev.pointerId,
                        startTime: performance.now(),
                        time: performance.now(),
                        speed: 0,
                    });
                }
            });

            //
            const registerMove = ev => {
                if (swipes.has(ev.pointerId)) {
                    const swipe = swipes.get(ev.pointerId);
                    Object.assign(swipe, {
                        //speed: (swipe.speed == 0 ? speed : (speed * 0.8 + swipe.speed * 0.2)),
                        current: [ev.pageX, ev.pageY],
                        pointerId: ev.pointerId,
                        time: performance.now(),
                    });
                }
            };

            //
            const compAngle = (a, c) => {
                return ((a - c + 540) % 360) - 180;
            };

            //
            const comleteSwipe = pointerId => {
                if (swipes.has(pointerId)) {
                    const swipe = swipes.get(pointerId);
                    const diffP = [swipe.start[0] - swipe.current[0], swipe.start[1] - swipe.current[1]];
                    const diffT = performance.now() - swipe.startTime;

                    //
                    const speed = Math.hypot(...diffP) / diffT;
                    swipe.speed = speed;

                    //
                    if (swipe.speed > (options.threshold || 0.5)) {
                        const swipeAngle = Math.atan2(swipe.current[1] - swipe.start[1], swipe.current[0] - swipe.start[0]);
                        swipe.swipeAngle = swipeAngle;
                        swipe.direction = "name";

                        //
                        if (Math.abs(compAngle(swipe.swipeAngle * (180 / Math.PI), 0)) <= 20) {
                            //AR.get(el.getAttribute("data-swipe-action-left"))?.(el);
                            swipe.direction = "left";
                        }

                        if (Math.abs(compAngle(swipe.swipeAngle * (180 / Math.PI), 180)) <= 20) {
                            //AR.get(el.getAttribute("data-swipe-action-right"))?.(el);
                            swipe.direction = "right";
                        }

                        if (Math.abs(compAngle(swipe.swipeAngle * (180 / Math.PI), 270)) <= 20) {
                            //AR.get(el.getAttribute("data-swipe-action-up"))?.(el);
                            swipe.direction = "up";
                        }

                        if (Math.abs(compAngle(swipe.swipeAngle * (180 / Math.PI), 90)) <= 20) {
                            //AR.get(el.getAttribute("data-swipe-action-down"))?.(el);
                            swipe.direction = "down";
                        }

                        options?.trigger?.(swipe);
                    }
                    swipes.delete(pointerId);
                }
            };

            //
            document.addEventListener("pointermove", registerMove, { capture: true });
            document.addEventListener("pointerup", ev => comleteSwipe(ev.pointerId), { capture: true });
            document.addEventListener("pointercancel", ev => comleteSwipe(ev.pointerId), { capture: true });
        }
    }

    //
    // @ts-ignore
    limitResize(real, virt, status, holder, container) {
        // @ts-ignore
        const [widthDiff, heightDiff] = this.#getSizeDiff(holder, container, [this.propGet("--resize-x") || 0, this.propGet("--resize-y") || 0]);

        // if centered
        real[0] = clamp(0, virt[0], widthDiff);
        real[1] = clamp(0, virt[1], heightDiff);
    }

    //
    limitDrag(real, virt, holder, container) {
        // @ts-ignore
        const [widthDiff, heightDiff] = this.#getSizeDiff(holder, container) || [0, 0];

        // if centered
        real[0] = clamp(-widthDiff * 0.5, virt[0], widthDiff * 0.5);
        real[1] = clamp(-heightDiff * 0.5, virt[1], heightDiff * 0.5);
    }

    //
    resizable(options) {
        // @ts-ignore
        const handler = options.handler ?? this.#holder;
        const status = {
            pointerId: -1,
        };

        //
        this.#resizeStatus = status;

        // @ts-ignore
        grabForDrag(this.#holder, ev, {
            propertyName: "resize",
            // @ts-ignore
            shifting: [parseFloat(this.#holder.style.getPropertyValue("--resize-x")) || 0, parseFloat(this.#holder.style.getPropertyValue("--resize-y")) || 0],
        });

        // @ts-ignore
        this.#holder.addEventListener(
            "m-dragging",
            ev => {
                const dt = ev.detail;
                if (this.#holder && dt.pointer.id == status.pointerId && dt.holding.element.deref() == this.#holder) {
                    // @ts-ignore
                    this.limitResize(dt.holding.modified, dt.holding.shifting, this.#holder, this.#holder.parentNode);
                }
            },
            { capture: true, passive: false }
        );
    }

    //
    draggable(options) {
        // @ts-ignore
        // @ts-ignore
        const handler = options.handler ?? this.#holder;
        const status = {
            pointerId: -1,
        };

        //
        this.#dragStatus = status;

        // @ts-ignore
        grabForDrag(this.#holder, ev, {
            propertyName: "drag",
            // @ts-ignore
            shifting: [parseFloat(this.#holder.style.getPropertyValue("--drag-x")) || 0, parseFloat(this.#holder.style.getPropertyValue("--drag-y")) || 0],
        });

        // @ts-ignore
        this.#holder.addEventListener(
            "m-dragging",
            ev => {
                const dt = ev.detail;
                if (this.#holder && dt.pointer.id == status.pointerId && dt.holding.element.deref() == this.#holder) {
                    // @ts-ignore
                    this.limitDrag(dt.holding.modified, dt.holding.shifting, this.#holder, this.#holder.parentNode);
                }
            },
            { capture: true, passive: false }
        );
    }

    //
    propGet(name) {
        // @ts-ignore
        const prop = this.#holder.style.getPropertyValue(name);
        const num = prop != null && prop != "" ? parseFloat(prop) || 0 : null;
        return num || null;
    }

    //
    propFloat(name, val) {
        // @ts-ignore
        if (parseFloat(this.#holder.style.getPropertyValue(name)) != val) {
            // @ts-ignore
            this.#holder.style.setProperty(name, val, "");
        }
    }

    //
    longpress(
        options = {},
        fx = ev => {
            ev.target.dispatchEvent(new CustomEvent("long-press", { detail: ev }));
        }
    ) {
        const handler = options.handler || this.#holder;
        const action = {
            pointerId: -1,
            timer: null,
            cancelPromise: null,
            imTimer: null,
            pageCoord: [0, 0],
            lastCoord: [0, 0],
            ready: false,
        };

        //
        const prepare = (resolve, action, ev) => {
            return async () => {
                if (action.pointerId == ev.pointerId) resolve?.();
            };
        };

        //
        const inPlace = () => {
            return Math.hypot(...action.lastCoord.map((n, i) => (action?.pageCoord?.[i] || 0) - n)) <= (options?.maxOffsetRadius ?? 10);
        };

        //
        const immediate = (resolve, action, ev) => {
            return async () => {
                if (action.pointerId == ev.pointerId) {
                    if (inPlace()) {
                        resolve?.();
                        fx?.(ev);
                    }
                    action.cancelRv?.();
                }
            };
        };

        //
        const forMove = [null, { capture: true }];
        const forCanc = [null, { capture: true }];

        //
        const registerCoord = [
            ev => {
                if (ev.pointerId == action.pointerId) {
                    action.lastCoord[0] = ev.pageX;
                    action.lastCoord[1] = ev.pageY;
                }
            },
            { capture: true, passive: true },
        ];

        //
        const triggerOrCancel = ev => {
            if (ev.pointerId == action.pointerId) {
                action.lastCoord[0] = ev.pageX;
                action.lastCoord[1] = ev.pageY;

                //
                ev.preventDefault();
                ev.stopPropagation();

                // JS math logic megalovania...
                if (action.ready) {
                    immediate(null, action, ev);
                } else {
                    action.cancelRv?.();
                }
            }
        };

        //
        const cancelWhenMove = ev => {
            if (ev.pointerId == action.pointerId) {
                action.lastCoord[0] = ev.pageX;
                action.lastCoord[1] = ev.pageY;

                //
                ev.preventDefault();
                ev.stopPropagation();

                // JS math logic megalovania...
                if (!inPlace()) {
                    action.cancelRv?.();
                }
            }
        };

        //
        // @ts-ignore
        forCanc[0] = triggerOrCancel;
        // @ts-ignore
        forMove[0] = cancelWhenMove;

        //
        handler.addEventListener(
            "pointerdown",
            ev => {
                if (action.pointerId < 0 && (options.anyPointer || ev.pointerType == "touch")) {
                    ev.preventDefault();
                    ev.stopPropagation();

                    //
                    action.pageCoord = [ev.pageX, ev.pageY];
                    action.lastCoord = [ev.pageX, ev.pageY];
                    action.pointerId = ev.pointerId;
                    // @ts-ignore
                    action.cancelPromise = new Promise(rv => {
                        action.cancelRv = () => {
                            //
                            // @ts-ignore
                            document.removeEventListener("pointerup", ...forCanc);
                            // @ts-ignore
                            document.removeEventListener("pointercancel", ...forCanc);
                            // @ts-ignore
                            document.removeEventListener("pointermove", ...forMove);

                            //
                            // @ts-ignore
                            clearTimeout(action.timer);
                            // @ts-ignore
                            clearTimeout(action.imTimer);
                            action.ready = false;
                            action.timer = null;
                            action.imTimer = null;
                            action.cancelRv = null;
                            action.cancelPromise = null;
                            action.pointerId = -1;
                            // @ts-ignore
                            rv();
                        };
                    });

                    //
                    if (ev.pointerType == "mouse" && options.mouseImmediate) {
                        fx?.(ev);
                        action?.cancelRv?.();
                    } else {
                        //
                        Promise.any([
                            // @ts-ignore
                            // @ts-ignore
                            // @ts-ignore
                            tpm((resolve, $rj) => (action.timer = setTimeout(prepare(resolve, action, ev), options?.minHoldTime ?? 300)), 1000 * 5).then(() => (action.ready = true)),
                            // @ts-ignore
                            // @ts-ignore
                            // @ts-ignore
                            tpm((resolve, $rj) => (action.imTimer = setTimeout(immediate(resolve, action, ev), options?.maxHoldTime ?? 600)), 1000),
                            action.cancelPromise,
                        ])
                            .catch(console.warn.bind(console))
                            .then(action.cancelRv);
                    }

                    //
                    // @ts-ignore
                    document.addEventListener("pointerup", ...forCanc);
                    // @ts-ignore
                    document.addEventListener("pointercancel", ...forCanc);
                    // @ts-ignore
                    document.addEventListener("pointermove", ...forMove);
                }
            },
            { passive: false, capture: false }
        );

        //
        // @ts-ignore
        document.addEventListener("pointerup", ...registerCoord);
        // @ts-ignore
        document.addEventListener("pointercancel", ...registerCoord);
        // @ts-ignore
        document.addEventListener("pointermove", ...registerCoord);
    }
}
