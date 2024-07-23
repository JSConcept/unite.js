Promise.allSettled([
    import("./Properties.ts"),
    import("./GridLayoutModLoader.ts"),
    import("./StyleRules.ts"),
    import("./Viewport.ts"),
    import("./Orientation.ts"),
    import("./Wallpaper.ts").then(()=>import("./WCanvas.ts"))
]);
