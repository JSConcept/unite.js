import {readable, type Readable} from "svelte/store";

//
export const whenHashChange = (): Readable<string> => {
    return readable(location.hash, (set) => {
        addEventListener("hashchange", ({}) => {
            set(location.hash);
        });
        addEventListener("popstate", ({}) => {
            set(location.hash);
        });
    });
};

//
export const currentLocationHash = whenHashChange();

//
export const whenMedia = (media = ""): Readable<boolean> => {
    const md = matchMedia(media);
    return readable(md.matches, (set) => {
        md.addEventListener("change", ({matches}) => {
            set(matches);
        });
    });
};

//
export const orientationType = (): Readable<string> => {
    return readable(screen.orientation.type, (set) => {
        screen.orientation.addEventListener("change", ({}) => {
            set(screen.orientation.type);
        });
    });
};

//
export const orientationAngle = (): Readable<number> => {
    return readable(screen.orientation.angle, (set) => {
        screen.orientation.addEventListener("change", ({}) => {
            set(screen.orientation.angle);
        });
    });
};

// for listen settings window size (use it only when mount)
export const whenResize = (element, box: ResizeObserverBoxOptions = "border-box") => {
    if (!element) return null;
    return readable(
        [element?.offsetWidth || 0, element?.offsetHeight || 0],
        (set) => {
            //
            const obs = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const boxSize =
                        entry[
                        box == "border-box"
                            ? "borderBoxSize"
                            : "contentBoxSize"
                        ][0];
                    if (box) {
                        set([boxSize.inlineSize, boxSize.blockSize]);
                    }
                }
            });

            //
            if (element) {
                obs.observe(element, {box});
            }
        }
    );
};
