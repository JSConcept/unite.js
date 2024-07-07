//
export const observeContentBox = (element, cb)=>{
    const observer = new ResizeObserver((entries, observer)=>{
        for (const entry of entries) {
            if (entry.contentBoxSize) {
                cb(entry.contentBoxSize[0]);
            }
        }
    });
    observer.observe(element, {box: "content-box"});
}

//
export const observeBorderBox = (element, cb)=>{
    const observer = new ResizeObserver((entries, observer)=>{
        for (const entry of entries) {
            if (entry.contentBoxSize) {
                cb(entry.borderBoxSize[0]);
            }
        }
    });
    observer.observe(element, {box: "border-box"});
}

//
export const observeAttribute = (element, attribute, cb)=>{
    const observer = new MutationObserver((mutationList, observer)=>{
        for (const mutation of mutationList) {
            if (mutation.type == "attributes" && new Set((attribute.split(",")||[attribute]).map((s)=>s.trim())).has(mutation.attributeName)) {
                cb(mutation);
            }
        }
    });
    observer.observe(element, {
        attributes: true
    });
}

//
export const observeBySelector = (element, selector, cb)=>{
    const observer = new MutationObserver((mutationList, observer)=>{
        for (const mutation of mutationList) {
            if (mutation.type == "childList") {
                cb({
                    ...mutation,
                    addedNodes: Array.from(mutation.addedNodes || []).filter((el)=>el.matches(selector)),
                    removedNodes: Array.from(mutation.removedNodes || []).filter((el)=>el.matches(selector)),
                });
            }
        }
    });
    observer.observe(element, {
        childList: true,
        subtree: true
    });
}
