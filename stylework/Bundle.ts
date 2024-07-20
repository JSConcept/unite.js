import("./Properties.ts").then(()=>Promise.allSettled([
    import("./StyleRules.ts"),
    import("./Viewport.ts"),
    import("./Orientation.ts"),
    import("./Wallpaper.ts").then((_)=>import("./WCanvas.ts")),
]));

