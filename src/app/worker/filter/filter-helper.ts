import {CImage} from "../../model/CImage";
import {PNG} from "pngjs";
import DrawUtil from "../../utils/draw-util";
import CImageUtil from "../../utils/cimage-util";
import {Layer} from "../../model/layer";

export namespace FilterHelper {

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

  export function canvasToImage(canvas: HTMLCanvasElement, image: CImage, imageType: string = "image/png") {
    image.data = FilterHelper.canvasToBase64(canvas, imageType);
    image.width = canvas.width;
    image.height = canvas.height;
    image.fileExtension = imageType.substr(imageType.lastIndexOf('/') + 1);
    return image;
  }

  export function imageToPNG(image: CImage): PNG {
    const sourceBuffer = new Buffer(image.data, 'base64');
    return PNG.sync.read(sourceBuffer);
  }

  export function pngToBase64(png: PNG) {
    const targetBuff = PNG.sync.write(png, {colorType: 2});
    return targetBuff.toString('base64');
  }

  export function pngToImage(png: PNG, image: CImage) {
    image.data = FilterHelper.pngToBase64(png);
    image.width = png.width;
    image.height = png.height;
    return image
  }


  export function componentToHex(c: number) {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  export function rgbToHex(r, g, b): string {
    return componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

  export function createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  export function get2DContext(canvas: HTMLCanvasElement) {
    return canvas.getContext("2d");
  }

  export function base64StringToCanvas(base64: string): HTMLCanvasElement {
    const buffer = new Buffer(base64, 'base64');
    const png = PNG.sync.read(buffer);
    const array = new Uint8ClampedArray(png.data);
    const imageData = new ImageData(array, png.width, png.height);
    const canvas = FilterHelper.createCanvas(png.width, png.height);
    const cx = FilterHelper.get2DContext(canvas);
    cx.putImageData(imageData, 0, 0);
    return canvas
  }
}
