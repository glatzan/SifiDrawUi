import {CImage} from '../model/cimage';
import {Layer} from '../model/layer';

export default class CImageUtil {
  static prepareImage(image: CImage) {
    console.log(image.layers.length)
    if (image.layers.length === 0) {
      const layer = new Layer(1);
      image.layers.push(layer);
    }
  }
}
