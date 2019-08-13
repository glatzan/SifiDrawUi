import {CImage} from '../model/cimage';
import {Layer} from '../model/layer';

export default class CImageUtil {
  static prepareImage(image: CImage) {
    console.log(image.layers.length)
    if (image.layers.length === 0) {
      const layer = new Layer(1);
      image.layers.push(layer);
    }

    for (let layer of image.layers) {
      console.log(layer.line)
      if (layer.line === undefined) {
        if (layer.lines.length === 0)
          CImageUtil.setFirstLineOfLayer(layer);
        else
          CImageUtil.newLine(layer);
      }
    }
  }

  static setLastLineOfLayer(layer : Layer) {
    layer.line = layer.lines[layer.lines.length - 1];
  }

  static setFirstLineOfLayer(layer : Layer) {
    layer.line = layer.lines[0];
  }

  static hasLines(layer : Layer): boolean {
    return layer.lines !== undefined && layer.lines.length > 0
  }

  static newLine(layer : Layer) {
    layer.lines.push([]);
    layer.line = layer.lines[layer.lines.length - 1];
  }
}
