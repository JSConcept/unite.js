// @ts-nocheck
import {grabForDrag} from "./pointer-api.mjs";

//
const clamp = (min, val, max) => {
    return Math.max(min, Math.min(val, max));
};

//
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

//
const widthOf = Symbol("@width");
const heightOf = Symbol("@height");

//
export default class AxGesture {
    #holder = null;
    #getSizeDiff = (holder, container, shifting) => {};
    #dragStatus = {};
    #resizeStatus = {};
    #resizeMute = false;
    #observer = null;

    //
    constructor(holder) {
        if (!holder) {
            throw Error("Element is null...");
        }

        //
        this.#holder = holder;

        //
        this.#getSizeDiff = (holder, container, shifting = [0, 0]) => {
            // increase some FPS (but needs to resolve `offsetWidth` problem of main box)
            const widthDiff = container.offsetWidth - holder[widthOf]; //(holder.clientWidth - shifting[0]);
            const heightDiff = container.offsetHeight - holder[heightOf]; //(holder.clientHeight - shifting[1]);
            return [widthDiff, heightDiff];
        };

        //
        this.#observer = new ResizeObserver((entries) => {
            if (this.#resizeMute) return;
            for (const entry of entries) {
                if (entry.borderBoxSize) {
                    const borderBoxSize = entry.borderBoxSize[0];
                    if (borderBoxSize) {
                        this.#holder[widthOf] =
                            borderBoxSize.inlineSize -
                            (this.propGet("--resize-x") || 0);
                        this.#holder[heightOf] =
                            borderBoxSize.blockSize -
                            (this.propGet("--resize-y") || 0);
                    }
                }
            }
        });

        //
        this.#holder[widthOf] = this.#holder.clientWidth;
        this.#holder[heightOf] = this.#holder.clientHeight;
        this.#observer.observe(this.#holder, { box: "border-box" });
    }

    //
    swipe(options) {
        if (options?.handler) {
            //
            const swipes = new Map([]);

            //
            options?.handler?.addEventListener("pointerdown", (ev) => {
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
            const registerMove = (ev) => {
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
            const completeSwipe = (pointerId) => {
                if (swipes.has(pointerId)) {
                    const swipe = swipes.get(pointerId);
                    const diffP = [
                        swipe.start[0] - swipe.current[0],
                        swipe.start[1] - swipe.current[1],
                    ];
                    const diffT = performance.now() - swipe.startTime;

                    //
                    const speed = Math.hypot(...diffP) / diffT;
                    swipe.speed = speed;

                    //
                    if (swipe.speed > (options.threshold || 0.5)) {
                        const swipeAngle = Math.atan2(
                            swipe.current[1] - swipe.start[1],
                            swipe.current[0] - swipe.start[0]
                        );
                        swipe.swipeAngle = swipeAngle;
                        swipe.direction = "name";

                        //
                        if (
                            Math.abs(
                                compAngle(swipe.swipeAngle * (180 / Math.PI), 0)
                            ) <= 20
                        ) {
                            //AR.get(el.getAttribute("data-swipe-action-left"))?.(el);
                            swipe.direction = "left";
                        }

                        if (
                            Math.abs(
                                compAngle(
                                    swipe.swipeAngle * (180 / Math.PI),
                                    180
                                )
                            ) <= 20
                        ) {
                            //AR.get(el.getAttribute("data-swipe-action-right"))?.(el);
                            swipe.direction = "right";
                        }

                        if (
                            Math.abs(
                                compAngle(
                                    swipe.swipeAngle * (180 / Math.PI),
                                    270
                                )
                            ) <= 20
                        ) {
                            //AR.get(el.getAttribute("data-swipe-action-up"))?.(el);
                            swipe.direction = "up";
                        }

                        if (
                            Math.abs(
                                compAngle(
                                    swipe.swipeAngle * (180 / Math.PI),
                                    90
                                )
                            ) <= 20
                        ) {
                            //AR.get(el.getAttribute("data-swipe-action-down"))?.(el);
                            swipe.direction = "down";
                        }

                        options?.trigger?.(swipe);
                    }
                    swipes.delete(pointerId);
                }
            };

            //
            document.addEventListener("pointermove", registerMove, {
                capture: true,
            });
            document.addEventListener(
                "pointerup",
                (ev) => completeSwipe(ev.pointerId),
                { capture: true }
            );
            document.addEventListener(
                "pointercancel",
                (ev) => completeSwipe(ev.pointerId),
                { capture: true }
            );
        }
    }

    //
    limitResize(real, virtual, status, holder, container) {
        const [widthDiff, heightDiff] = this.#getSizeDiff(
            holder,
            container,
            real
        ) || [0, 0];

        // if relative of un-resized to edge corner max-size
        // discount of dragging offset!
        real[0] = clamp(
            0,
            virtual[0],
            widthDiff - (this.propGet("--drag-x") || 0)
        );
        real[1] = clamp(
            0,
            virtual[1],
            heightDiff - (this.propGet("--drag-y") || 0)
        );
    }

    //
    limitDrag(real, virtual, holder, container) {
        const [widthDiff, heightDiff] = this.#getSizeDiff(
            holder,
            container
        ) || [0, 0];
        
        console.log(widthDiff, heightDiff);

        // if centered
        real[0] = clamp(-widthDiff * 0.5, virtual[0], widthDiff * 0.5);
        real[1] = clamp(-heightDiff * 0.5, virtual[1], heightDiff * 0.5); 

        // if origin in top-left
        //real[0] = clamp(0, virtual[0], widthDiff);
        //real[1] = clamp(0, virtual[1], heightDiff);
    }

    //
    resizable(options) {
        const handler = options.handler ?? this.#holder;
        const status = {
            pointerId: -1,
        };

        //
        this.#resizeStatus = status;

        //
        handler.addEventListener("pointerdown", (ev) => {
            grabForDrag(this.#holder, ev, {
                propertyName: "resize",
                shifting: [
                    this.propGet("--resize-x") || 0,
                    this.propGet("--resize-y") || 0,
                ],
            });
        });

        //
        this.#holder.addEventListener(
            "m-dragstart",
            (ev) => {
                status.pointerId = ev.pointerId;
                this.#resizeMute = true;
            },
            { capture: true, passive: false }
        );

        //
        this.#holder.addEventListener(
            "m-dragging",
            (ev) => {
                const dt = ev.detail;
                if (
                    this.#holder &&
                    dt.pointer.id == status.pointerId &&
                    dt.holding.element.deref() == this.#holder
                ) {
                    this.limitResize(
                        dt.holding.modified,
                        dt.holding.shifting,
                        this.#holder,
                        this.#holder.parentNode
                    );
                }
            },
            { capture: true, passive: false }
        );

        //
        this.#holder.addEventListener(
            "m-dragend",
            (ev) => {
                this.#resizeMute = false;
            },
            { capture: true, passive: false }
        );
    }

    //
    draggable(options) {
        const handler = options.handler ?? this.#holder;
        const status = {
            pointerId: -1,
        };

        //
        this.#dragStatus = status;

        //
        handler.addEventListener("pointerdown", (ev) => {
            status.pointerId = ev.pointerId;
            grabForDrag(this.#holder, ev, {
                propertyName: "drag",
                shifting: [
                    this.propGet("--drag-x") || 0,
                    this.propGet("--drag-y") || 0,
                ],
            });
        });

        //
        this.#holder.addEventListener(
            "m-dragging",
            (ev) => {
                const dt = ev.detail;
                if (
                    this.#holder &&
                    dt.pointer.id == status.pointerId &&
                    dt.holding.element.deref() == this.#holder
                ) {
                    this.limitDrag(
                        dt.holding.modified,
                        dt.holding.shifting,
                        this.#holder,
                        this.#holder.parentNode
                    );
                }
            },
            { capture: true, passive: false }
        );
    }

    //
    propGet(name) {
        const prop = this.#holder.style.getPropertyValue(name);
        const num = prop != null && prop != "" ? parseFloat(prop) || 0 : null;
        return num || null;
    }

    //
    propFloat(name, val) {
        if (parseFloat(this.#holder.style.getPropertyValue(name)) != val) {
            this.#holder.style.setProperty(name, val, "");
        }
    }

    //
    longPress(
        options = {},
        fx = (ev) => {
            ev.target.dispatchEvent(
                new CustomEvent("long-press", { detail: ev })
            );
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
            return (
                Math.hypot(
                    ...action.lastCoord.map(
                        (n, i) => (action?.pageCoord?.[i] || 0) - n
                    )
                ) <= (options?.maxOffsetRadius ?? 10)
            );
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
            (ev) => {
                if (ev.pointerId == action.pointerId) {
                    action.lastCoord[0] = ev.pageX;
                    action.lastCoord[1] = ev.pageY;
                }
            },
            { capture: true, passive: true },
        ];

        //
        const triggerOrCancel = (ev) => {
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
        const cancelWhenMove = (ev) => {
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
        forCanc[0] = triggerOrCancel;
        forMove[0] = cancelWhenMove;

        //
        handler.addEventListener(
            "pointerdown",
            (ev) => {
                if (
                    action.pointerId < 0 &&
                    (options.anyPointer || ev.pointerType == "touch")
                ) {
                    ev.preventDefault();
                    ev.stopPropagation();

                    //
                    action.pageCoord = [ev.pageX, ev.pageY];
                    action.lastCoord = [ev.pageX, ev.pageY];
                    action.pointerId = ev.pointerId;

                    //
                    const cancelPromiseWithResolve = Promise.withResolvers();
                    action.cancelPromise = cancelPromiseWithResolve.promise;
                    action.cancelRv = () => {
                        document.removeEventListener("pointerup", ...forCanc);
                        document.removeEventListener(
                            "pointercancel",
                            ...forCanc
                        );
                        document.removeEventListener("pointermove", ...forMove);

                        //
                        clearTimeout(action.timer);
                        clearTimeout(action.imTimer);
                        action.ready = false;
                        action.timer = null;
                        action.imTimer = null;
                        action.cancelRv = null;
                        action.cancelPromise = null;
                        action.pointerId = -1;

                        //
                        cancelPromiseWithResolve.resolve();
                    };

                    //
                    if (ev.pointerType == "mouse" && options.mouseImmediate) {
                        fx?.(ev);
                        action?.cancelRv?.();
                    } else {
                        //
                        Promise.any([
                            tpm(
                                (resolve, $rj) =>
                                    (action.timer = setTimeout(
                                        prepare(resolve, action, ev),
                                        options?.minHoldTime ?? 300
                                    )),
                                1000 * 5
                            ).then(() => (action.ready = true)),
                            tpm(
                                (resolve, $rj) =>
                                    (action.imTimer = setTimeout(
                                        immediate(resolve, action, ev),
                                        options?.maxHoldTime ?? 600
                                    )),
                                1000
                            ),
                            action.cancelPromise,
                        ])
                            .catch(console.warn.bind(console))
                            .then(action.cancelRv);
                    }

                    //
                    document.addEventListener("pointerup", ...forCanc);
                    document.addEventListener("pointercancel", ...forCanc);
                    document.addEventListener("pointermove", ...forMove);
                }
            },
            { passive: false, capture: false }
        );

        //

        document.addEventListener("pointerup", ...registerCoord);
        document.addEventListener("pointercancel", ...registerCoord);
        document.addEventListener("pointermove", ...registerCoord);
    }
}
