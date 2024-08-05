export default Promise.allSettled([
    import("./Properties.ts"),
    import("./StyleRules.ts"),
    import("./Viewport.ts"),
    import("./Orientation.ts")?.catch?.(console.warn.bind(console)),
    import("./Appear.ts"),
    import("./Wallpaper.ts").then(()=>import("./WCanvas.ts"))
]);
