import {CImage} from "../../model/CImage";
import {PNG} from "pngjs";
import DrawUtil from "../../utils/draw-util";
import CImageUtil from "../../utils/cimage-util";

export namespace FilterHelper {
  export function updateImage(image: CImage, png: PNG) {
    const targetBuffer = PNG.sync.write(png, {colorType: 2});
    image.data = targetBuffer.toString('base64');
    image.width = png.width;
    image.height = png.height;
    return image;
  }

  export function createNewImage(width: number, height: number, background: string = "#000", name : string = "tmp") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    DrawUtil.drawRect(canvas.getContext("2d"), 0, 0, width, height, background);

    const image = new CImage();
    image.id = name;
    image.name = name;
    image.fileExtension = "png";
    image.width = width;
    image.height = height;
    CImageUtil.prepareImage(image);
    image.data = DrawUtil.canvasAsBase64(canvas);
    return image;
  }

  export function componentToHex(c: number) {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  export function rgbToHex(r, g, b): string {
    return componentToHex(r) + componentToHex(g) + componentToHex(b);
  }
}
