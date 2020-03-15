import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";
import {ColorType} from "pngjs";

export class MaxifyColorChannelFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, maxifyOptions?: MaxifyOptions) {
    return map((data: FilterData) => {

        if (maxifyOptions === undefined)
          maxifyOptions = {};

        if(!maxifyOptions.colorType)
          maxifyOptions.colorType = 4;

        let [source, target] = this.getSourceAndTarget(data, sourcePos, maxifyOptions.targetImagePos);

        if (!target)
          target = source;

        const r = maxifyOptions.threshold_r ? maxifyOptions.threshold_r : 256;
        const g = maxifyOptions.threshold_g ? maxifyOptions.threshold_g : 256;
        const b = maxifyOptions.threshold_b ? maxifyOptions.threshold_b : 256;

        const sourceImage = FilterHelper.imageToPNG(source);
        const targetImage = FilterHelper.createPNG(sourceImage.width, sourceImage.height);

        for (let x = 0; x < sourceImage.width; x++) {
          for (let y = 0; y < sourceImage.height; y++) {
            const idx = (sourceImage.width * y + x) << 2;
            targetImage.data[idx] = (sourceImage.data[idx] >= r) ? 255 : 0;
            targetImage.data[idx + 1] = (sourceImage.data[idx + 1] >= g) ? 255 : 0;
            targetImage.data[idx + 2] = (sourceImage.data[idx + 2] >= b) ? 255 : 0;
            targetImage.data[idx + 3] = sourceImage.data[idx + 3];
          }
        }

        FilterHelper.pngToImage(targetImage, target,maxifyOptions.colorType);
        return data;
      }
    );
  }
}

export interface MaxifyOptions {
  targetImagePos?: number
  threshold_r?: number
  threshold_g?: number
  threshold_b?: number
  colorType?: ColorType
}
