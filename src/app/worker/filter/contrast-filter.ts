import {PNG} from "pngjs";
import {CImage} from "../../model/CImage";
import {AbstractFilter, Services} from "./abstract-filter";
import {FilterHelper} from "./filter-helper";

export class ContrastFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(source: CImage, target: CImage, contrast: number) {

    const sourceBuffer = new Buffer(source.data, 'base64');
    const sourceImage = PNG.sync.read(sourceBuffer);

    const targetImage = new PNG({width: sourceImage.width, height: sourceImage.height});

    let i = 0;
    for (let y = 0; y < sourceImage.height; y++) {
      for (let x = 0; x < sourceImage.width; x++) {
        const r = sourceImage.data[i] * contrast;
        const g = sourceImage.data[i + 1] * contrast;
        const b = sourceImage.data[i + 2] * contrast;

        targetImage.data[i] = r > 255 ? 255 : r;
        targetImage.data[i + 1] = g > 255 ? 255 : g;
        targetImage.data[i + 2] = b > 255 ? 255 : b;
        targetImage.data[i + 3] = sourceImage.data[i + 3];
        i += 4;
      }
    }

    FilterHelper.updateImage(target, targetImage);
  }
}
