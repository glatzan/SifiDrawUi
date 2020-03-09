import {CImage} from "../../model/CImage";
import {PNG} from "pngjs";
import DrawUtil from "../../utils/draw-util";
import CImageUtil from "../../utils/cimage-util";
import {Layer} from "../../model/layer";

export namespace FilterHelper {

  export function updateImageFromPNG(image: CImage, png: PNG) {
    const targetBuffer = PNG.sync.write(png, {colorType: 2});
    image.data = targetBuffer.toString('base64');
    image.width = png.width;
    image.height = png.height;
    return image;
  }

  export function updateImageFromCanvas(image: CImage, canvas: HTMLCanvasElement, imageType: string = "image/png") {
    image.data = FilterHelper.canvasToBase64(canvas, imageType);
    image.width = canvas.width;
    image.height = canvas.height;
    image.fileExtension = imageType.substr(imageType.lastIndexOf('/') + 1);
    return image;
  }


  export function createNewImage(width: number, height: number, background: string = "#000", name: string = "tmp") {
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

  export function findLayer(layers: Layer[], id: string): Layer {
    for (let layer of layers) {
      if (layer.id == id) {
        return layer;
      }
    }
    return null
  }

  export function canvasToBase64(canvas: HTMLCanvasElement, imageType: string = "image/png"): string {
    const result = canvas.toDataURL(imageType);
    return result.substr(result.indexOf(',') + 1);
  }

  export function loadAsPNG(image: CImage): PNG {
    const sourceBuffer = new Buffer(image.data, 'base64');
    return PNG.sync.read(sourceBuffer);
  }

  export function componentToHex(c: number) {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  export function rgbToHex(r, g, b): string {
    return componentToHex(r) + componentToHex(g) + componentToHex(b);
  }
}
