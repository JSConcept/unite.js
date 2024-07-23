//
export const properties = [
    {
        name: "--visual-width",
        syntax: "<length-percentage>",
        inherits: true,
        initialValue: "0px",
    },
    {
        name: "--visual-height",
        syntax: "<length-percentage>",
        inherits: true,
        initialValue: "0px",
    },
    {
        name: "--clip-ampl",
        syntax: "<number>",
        inherits: true,
        initialValue: "0",
    },
    {
        name: "--clip-freq",
        syntax: "<number>",
        inherits: true,
        initialValue: "0",
    },
    {
        name: "--pfrot",
        syntax: "<angle>",
        inherits: true,
        initialValue: "0deg",
    },
    {
        name: "--lfrot",
        syntax: "<angle>",
        inherits: true,
        initialValue: "0deg",
    },
    {name: "--prot", syntax: "<angle>", inherits: true, initialValue: "0deg"},
    {name: "--lrot", syntax: "<angle>", inherits: true, initialValue: "0deg"},
    {
        name: "--pth",
        syntax: "<length-percentage>",
        inherits: true,
        initialValue: "0px",
    },
    {
        name: "--ptw",
        syntax: "<length-percentage>",
        inherits: true,
        initialValue: "0px",
    },
    {
        name: "--lth",
        syntax: "<length-percentage>",
        inherits: true,
        initialValue: "0px",
    },
    {
        name: "--ltw",
        syntax: "<length-percentage>",
        inherits: true,
        initialValue: "0px",
    },
    {
        name: "--ptrans-x",
        syntax: "<length-percentage>",
        inherits: true,
        initialValue: "0px",
    },
    {
        name: "--ptrans-y",
        syntax: "<length-percentage>",
        inherits: true,
        initialValue: "0px",
    },
    {
        name: "--ltrans-x",
        syntax: "<length-percentage>",
        inherits: true,
        initialValue: "0px",
    },
    {
        name: "--ltrans-y",
        syntax: "<length-percentage>",
        inherits: true,
        initialValue: "0px",
    },
    {
        name: "--avail-width",
        syntax: "<length-percentage>",
        inherits: true,
        initialValue: "0px",
    },
    {
        name: "--avail-height",
        syntax: "<length-percentage>",
        inherits: true,
        initialValue: "0px",
    },
    {
        name: "--pixel-ratio",
        syntax: "<number>",
        inherits: true,
        initialValue: "1",
    },
];

// define properties
properties.forEach((o) => {
    try {
        CSS?.registerProperty?.(o)
    } catch(e) {
        console.warn(e);
    }
});
