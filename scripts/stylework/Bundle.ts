export default Promise.allSettled([
    import("./Properties.ts"),
    import("./GridLayoutModLoader.ts"),
    import("./StyleRules.ts"),
    import("./Viewport.ts"),
    import("./Orientation.ts"),
    import("./Appear.ts"),
    import("./Wallpaper.ts").then(()=>import("./WCanvas.ts"))
]);
