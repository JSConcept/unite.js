//
CSS?.registerProperty?.({
    name: "--orient",
    syntax: "<integer>",
    inherits: true,
    initialValue: "0",
});

//
CSS?.registerProperty?.({
    name: "--columns",
    syntax: "<integer>",
    inherits: true,
    initialValue: "1",
});

//
CSS?.registerProperty?.({
    name: "--rows",
    syntax: "<integer>",
    inherits: true,
    initialValue: "1",
});


//
CSS?.registerProperty?.({
    name: "--cell-x",
    syntax: "<integer>",
    inherits: true,
    initialValue: "0",
});

//
CSS?.registerProperty?.({
    name: "--cell-y",
    syntax: "<integer>",
    inherits: true,
    initialValue: "0",
});



//
CSS?.registerProperty?.({
    name: "--grid-column",
    syntax: CSS.supports("display", "layout(grid-page)") ? "<number>" : "<integer>",
    inherits: true,
    initialValue: "0",
});

//
CSS?.registerProperty?.({
    name: "--grid-row",
    syntax: CSS.supports("display", "layout(grid-page)") ? "<number>" : "<integer>",
    inherits: true,
    initialValue: "0",
});


//
if ("layoutWorklet" in CSS) {
    // @ts-ignore
    CSS.layoutWorklet.addModule(new URL("./GridLayoutMod.mjs", import.meta.url).href);
}
