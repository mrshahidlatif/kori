import { parse } from "vega-parser";
import { View } from "vega-view";

const THUMBNAIL_HEIGHT = 250;
export default async (spec) => {
    // parse the spec and get the view
    const runtime = parse(spec);
    const view = await new View(runtime).runAsync();
    // conver the view to an image
    const img = await view.toImageURL("png"); // base64
    // resize the image to a thumbnail size
    const resized = await resize(img);
    return resized;
};

function resize(orgImg) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = orgImg;
        img.onload = function () {
            // draw the image into a thumbnail scale
            const height = THUMBNAIL_HEIGHT;
            const width = (height / img.height) * img.width;
            const canvas = document.createElement("canvas"),
                ctx = canvas.getContext("2d");

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(this, 0, 0, width, height);

            // return rescaled base64 image url
            resolve(canvas.toDataURL());
        };
    });
}
