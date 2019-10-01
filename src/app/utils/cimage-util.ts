import {CImage} from '../model/cimage';
import {Layer} from '../model/layer';
import {Point} from '../model/point';

export default class CImageUtil {

  static prepareImage(image: CImage) {
    if (!CImageUtil.hasLayer(image))
      CImageUtil.addLayer(image)

    for (const layer of image.layers) {
      if (layer.line === undefined) {
        if (CImageUtil.hasLines(layer)) {
          CImageUtil.initFirstLineOfLayer(layer);
        } else {
          CImageUtil.addLine(layer);
        }
      }
    }
  }

  static initFirstLineOfLayer(layer: Layer): Point[] {
    if (layer.lines == undefined || layer.lines.length == 0)
      return layer.line = CImageUtil.addLine(layer);
    return layer.line = layer.lines[0];
  }

  static initLastLineOfLayer(layer: Layer): Point[] {
    if (layer.lines == undefined || layer.lines.length == 0)
      return layer.line = CImageUtil.addLine(layer);
    return layer.line = layer.lines[layer.lines.length - 1];
  }

  static addLine(layer: Layer): Point[] {
    layer.lines.push([]);
    return layer.line = layer.lines[layer.lines.length - 1];
  }

  static hasLines(layer: Layer): boolean {
    return layer.lines !== undefined && layer.lines.length !== 0;
  }

  static removeLine(layer: Layer, line: Point[]) {

    if (layer.lines.length === 1) {
      return;
    }

    let i = 0;
    for (const ll of layer.lines) {
      if (ll === line) {
        layer.lines.splice(i, 1);
        break;
      }
      i++;
    }

    if (layer.line === line) {
      layer.line = layer.lines[i - 1];
    }
  }

  static addPointToCurrentLine(layer: Layer, x: number, y: number) {
    CImageUtil.addPointToLine(layer.line, x, y);
  }

  static addPointToLine(line: Point[], x: number, y: number) {
    line.push({x: x, y: y});
  }

  static findOrAddLayer(image: CImage, layerID: string) {
    if (!CImageUtil.hasLayer(image)) {
      return CImageUtil.addLayer(image, layerID)
    } else {
      const tmp = CImageUtil.findLayer(image, layerID);
      if (tmp != null)
        return tmp;
      return CImageUtil.addLayer(image, layerID)
    }
  }

  static findLayer(image: CImage, layerID: string) {
    for (const layer of image.layers) {
      if (layer.id === layerID) {
        return layer;
      }
    }
    return null;
  }

  static addLayer(img: CImage, layerID?: string): Layer {
    if (!CImageUtil.hasLayer(img)) {
      img.layers = [new Layer(layerID ? layerID : "1")];
      return img.layers[0];
    }
    img.layers = [...img.layers, (new Layer(layerID ? layerID : "" + (img.layers.length + 1)))];
    return img.layers[img.layers.length - 1]
  }

  static hasLayer(img: CImage) {
    return img.layers !== undefined && img.layers.length !== 0
  }
}
