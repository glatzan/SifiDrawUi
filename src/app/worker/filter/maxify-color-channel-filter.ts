import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";

export class MaxifyColorChannelFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, maxifyOptions?: MaxifyOptions) {
    return map((data: FilterData) => {

      if (maxifyOptions === undefined)
        maxifyOptions = {};

      const source = this.getImage(sourcePos, data);

      if (source == null)
        throw new Error(`Image not found index ${sourcePos}!`);


      let target = source;
      if (maxifyOptions.targetImagePos != null) {
        target = this.getImage(maxifyOptions.targetImagePos, data);
        if (target == null)
          throw new Error(`TargetImage not found index ${maxifyOptions.targetImagePos}!`);
      }

      const r = maxifyOptions.threshold_r !== undefined ? maxifyOptions.threshold_r : 256;
      const g = maxifyOptions.threshold_g !== undefined ? maxifyOptions.threshold_g : 256;
      const b = maxifyOptions.threshold_b !== undefined ? maxifyOptions.threshold_b : 256;

      const targetImage = FilterHelper.imageToPNG(source);

      for (let x = 0; x < targetImage.width; x++) {
        for (let y = 0; y < targetImage.height; y++) {
          const idx = (targetImage.width * y + x) << 2;

          if (targetImage.data[idx] >= r) {
            targetImage.data[idx] = 255;
          }
          if (targetImage.data[idx + 1] >= g) {
            targetImage.data[idx + 1] = 255;
          }

          if (targetImage.data[idx] >= b) {
            targetImage.data[idx + 2] = 255;
          }
        }
      }

      FilterHelper.pngToImage(targetImage, target);
      return data;
    });
  }
}

export interface MaxifyOptions {
  targetImagePos?: number
  threshold_r?: number
  threshold_g?: number
  threshold_b?: number
}
