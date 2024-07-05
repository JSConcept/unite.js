// @ts-nocheck

//
const extractURL = function (css_url) {
    let uri = css_url.match(/^\s*url\(\s*(.*)\s*\)\s*$/)[1],
        last = uri.length - 1;
    if (
        (uri[0] === '"' && uri[last] === '"') ||
        (uri[0] === "'" && uri[last] === "'")
    ) {
        uri = uri.slice(1, -1);
    }
    return uri;
};

// TODO: support for animations
// inStyle - got by getComputedStyle
// outStyle - style of element
const BakeImage = async (inStyle, outStyle, name = "--mx-bg") => {
    const url = extractURL(inStyle.getProperty(name + "-source"));
    const filter = inStyle.getProperty(name + "-filter");
    const image = await fetch(url)
        .then((r) => r.blob())
        .then(createImageBitmap.bind(window))
        .catch(console.error.bind(console));
    const canvas = new OffscreenCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d", {
        willReadFrequently: true,
        desynchronized: true,
        powerPreference: "high-performance",
    });
    const rect = [0, 0, canvas.width, canvas.height];
    ctx.save();
    ctx.filter = filter || "";
    ctx.clearRect(...rect);
    ctx.drawImage(image, ...rect);
    ctx.restore();
    const result = await canvas.convertToBlob({ type: "image/png" });
    outStyle.setProperty(name + "-image", URL.createObjectURL(result), "");
    return result;
};

//
export default BakeImage;
