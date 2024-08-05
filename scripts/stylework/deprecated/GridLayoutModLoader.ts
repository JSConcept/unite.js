
//
CSS?.registerProperty?.({
    name: "--orient",
    syntax: "<integer>",
    inherits: true,
    initialValue: "0",
});

//
CSS?.registerProperty?.({
    name: "--layout-c",
    syntax: "<integer>",
    inherits: true,
    initialValue: "1",
});

//
CSS?.registerProperty?.({
    name: "--layout-r",
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
    name: "--grid-c",
    syntax: "<number>",//CSS.supports("display", "layout(grid-page)") ? "<number>" : "<integer>",
    inherits: true,
    initialValue: "0",
});

//
CSS?.registerProperty?.({
    name: "--grid-r",
    syntax: "<number>",//CSS.supports("display", "layout(grid-page)") ? "<number>" : "<integer>",
    inherits: true,
    initialValue: "0",
});

// pre-load (cache inside code)
import $Worklet from "./GridLayoutMod.mjs?raw";
if ("layoutWorklet" in CSS) {
    // @ts-ignore
    CSS.layoutWorklet.addModule(URL.createObjectURL(new Blob([$Worklet], {type: "text/javascript"})));
}
