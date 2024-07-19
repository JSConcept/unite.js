//
const cover = (ctx, img, scale = 1, port, orient, canvas) => {

    //
    switch (orient) {
        //
        case 1: {
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(0 * (Math.PI / 180));
            ctx.rotate(port * -90 * (Math.PI / 180));
            ctx.translate(-(img.width / 2) * scale, -(img.height / 2) * scale);
        }
            break;

        //
        case 0: {
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(90 * (Math.PI / 180));
            ctx.rotate(port * -90 * (Math.PI / 180));
            ctx.translate(-(img.width / 2) * scale, -(img.height / 2) * scale);
        }
            break;

        //
        case 3: {
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(180 * (Math.PI / 180));
            ctx.rotate(port * -90 * (Math.PI / 180));
            ctx.translate(-(img.width / 2) * scale, -(img.height / 2) * scale);
        }
            break;

        //
        case 2: {
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(270 * (Math.PI / 180));
            ctx.rotate(port * -90 * (Math.PI / 180));
            ctx.translate(-(img.width / 2) * scale, -(img.height / 2) * scale);
        }
            break;
    }

};


//
const ImageSourceName = "border-image-source";


// 
registerPaint('w-canvas', class {
    //static get inputProperties() { return ['--image', '--image-width', '--image-height', '--orient']; }
    static get inputProperties() { return [ImageSourceName, '--image-width', '--image-height', '--orient']; }
    paint(ctx, canvas, properties) {
        const img = { 
            width: properties.get("--image-width")?.value || 1, 
            height: properties.get("--image-height")?.value || 1
        };

        //
        const orient = properties.get("--orient").value;
        const ox = 1 - (orient%2);

        //
        const port = img.width < img.height ? 1 : 0;
        const scale = Math.max(
            canvas[["width", "height"][ox]] / img[["width", "height"][port]],
            canvas[["height", "width"][ox]] / img[["height", "width"][port]]);
            
        // 
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        //ctx.fillStyle = "black";
        //ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        cover(ctx, img, scale, port, orient, canvas);
        //ctx.drawImage(properties.get('--image'), 0, 0, img.width * scale, img.height * scale);
        ctx.drawImage(properties.get(ImageSourceName), 0, 0, img.width * scale, img.height * scale);
        ctx.restore();
    }
});
