//
export const viewportHandler = (event?: any) => {
    const layoutViewport = document.body;
    const viewport = event?.target || visualViewport;

    //
    document.documentElement.style.setProperty(
        "--visual-width",
        (viewport?.width || 0) + "px",
        ""
    );

    //
    const vvh = viewport?.height;
    const dff = vvh - (layoutViewport.getBoundingClientRect().height || window.innerHeight);
    const cvh = Math.min(Math.max(vvh - dff, viewport?.offsetTop || 0) - (viewport?.offsetTop || 0), (screen.availHeight || screen.height));
    document.documentElement.style.setProperty(
        "--visual-height",
        cvh + "px",
        ""
    );
};

//
window?.visualViewport?.addEventListener?.("scroll", viewportHandler);
window?.visualViewport?.addEventListener?.("resize", viewportHandler);

//
document.documentElement.addEventListener("fullscreenchange", viewportHandler);

//
if ("virtualKeyboard" in navigator) {
    // @ts-ignore
    navigator?.virtualKeyboard?.addEventListener?.(
        "geometrychange",
        viewportHandler,
        {passive: true}
    );
}

//
requestAnimationFrame(viewportHandler);
