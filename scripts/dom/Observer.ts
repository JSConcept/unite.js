
//
const onBorderObserve = new WeakMap<HTMLElement, Function[]>();
const onContentObserve = new WeakMap<HTMLElement, Function[]>();

//
export const observeContentBox = (element, cb) => {
    if (!onContentObserve.has(element)) {
        const callbacks: Function[] = [];

        //
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentBoxSize) {
                    const contentBoxSize = entry.contentBoxSize[0];
                    if (contentBoxSize) {
                        callbacks.forEach((cb) => cb?.(contentBoxSize, observer));
                    }
                }
            }
        });

        //
        cb?.({
            inlineSize: element.offsetWidth,
            blockSize: element.offsetHeight,
        }, observer);

        //
        onContentObserve.set(element, callbacks);
        observer.observe(element, {box: "content-box"});
    }

    //
    onContentObserve.get(element)?.push(cb);
};


//
export const observeBorderBox = (element, cb) => {
    if (!onBorderObserve.has(element)) {
        const callbacks: Function[] = [];

        //
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.borderBoxSize) {
                    const borderBoxSize = entry.borderBoxSize[0];
                    if (borderBoxSize) {
                        callbacks.forEach((cb) => cb?.(borderBoxSize, observer));
                    }
                }
            }
        });

        //
        cb?.({
            inlineSize: element.clientWidth,
            blockSize: element.clientHeight,
        }, observer);

        //
        onBorderObserve.set(element, callbacks);
        observer.observe(element, {box: "border-box"});
    }

    //
    onBorderObserve.get(element)?.push(cb);
}

//
export const observeAttribute = (element, attribute, cb) => {
    const observer = new MutationObserver((mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type == "attributes" && new Set((attribute.split(",") || [attribute]).map((s) => s.trim())).has(mutation.attributeName)) {
                cb(mutation, observer);
            }
        }
    });
    observer.observe(element, {
        attributeOldValue: true,
        attributes: true,
        attributeFilter: [attribute]
    });
};

//
export const observeAttributeBySelector = async (element, attribute, selector, cb) => {
    const observer = new MutationObserver((mutationList, observer) => {
        for (const mutation of mutationList) {
            if ((mutation.target as HTMLElement)?.matches?.(selector)) {
                cb(mutation, observer);
            }
        }
    });

    //
    observer.observe(element, {
        attributeOldValue: true,
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: [attribute],
        characterData: true
    });

    //
    Array.from(element.querySelectorAll(selector)).forEach((target)=>{
        cb({ target, type: "attributes", attributeName: attribute }, observer);
    });

};

//
export const observeBySelector = async (element, selector, cb) => {
    const observer = new MutationObserver((mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type == "childList") {
                const addedNodes = Array.from(mutation.addedNodes || []);
                const removedNodes = Array.from(mutation.removedNodes || []);
                cb({
                    ...mutation,
                    addedNodes: addedNodes.filter((el) => (<HTMLElement>el)?.matches?.(selector)),
                    removedNodes: removedNodes.filter((el) => (<HTMLElement>el)?.matches?.(selector)),
                }, observer);
            }
        }
    });

    //
    observer.observe(element, {
        childList: true,
        subtree: true
    });

    //
    cb({ addedNodes: Array.from(element.querySelectorAll(selector)) }, observer);
};
