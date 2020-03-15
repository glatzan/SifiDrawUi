import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";
import {PNG} from "pngjs";
import {CImage} from "../../model/CImage";

export class ThresholdFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, thresholdOptions?: ThresholdOptions) {
    return map((data: FilterData) => {
      if (thresholdOptions === undefined)
        thresholdOptions = {};

      const [r, b, g] = this.getThreshold(thresholdOptions);

      if (!thresholdOptions.targetData)
        thresholdOptions.targetData = "countData";

      const [source, target] = this.getSourceAndTarget(data, sourcePos, thresholdOptions.targetImagePos);

      const sourceImage = FilterHelper.imageToPNG(source);
      const targetImage = FilterHelper.createPNG(sourceImage.width, sourceImage.height);

      let counter = 0;

      for (let x = 0; x < sourceImage.width; x++) {
        for (let y = 0; y < sourceImage.height; y++) {
          const idx = (sourceImage.width * y + x) << 2;
          let c = true;

          if (r != -1) {
            if (sourceImage.data[idx] < r)
              c = false;
          }

          if (g != -1) {
            if (sourceImage.data[idx + 1] < g)
              c = false;
          }

          if (b != -1) {
            if (sourceImage.data[idx + 2] < b)
              c = false;
          }

          if (c) {
            counter++;
            if (target) {
              targetImage.data[idx] = sourceImage.data[idx];
              targetImage.data[idx + 1] = sourceImage.data[idx + 1];
              targetImage.data[idx + 2] = sourceImage.data[idx + 2];
              targetImage.data[idx + 3] = sourceImage.data[idx + 3];
            } else {
              targetImage.data[idx] = 0;
              targetImage.data[idx + 1] = 0;
              targetImage.data[idx + 2] = 0;
              targetImage.data[idx + 3] = 0;
            }
          }
        }
      }

      console.log("count" + counter);

      if (target) {
        FilterHelper.pngToImage(targetImage, target)
      }

      const entry = {tag: sourcePos.toString(), name: source.name, value: counter};
      data.pushData(thresholdOptions.targetData, entry);

      return data;
    });
  }

  protected getThreshold(threshold: ThresholdOptions): [number, number, number] {
    let r, g, b = -1;

    if (threshold.threshold_grey) {
      r = threshold.threshold_grey;
    } else {
      r = threshold.threshold_r !== undefined ? threshold.threshold_r : -1;
      g = threshold.threshold_g !== undefined ? threshold.threshold_g : -1;
      b = threshold.threshold_b !== undefined ? threshold.threshold_b : -1;
    }

    return [r, g, b]
  }
}

export interface ThresholdOptions {
  targetData?: string
  targetImagePos?: number
  threshold_r?: number
  threshold_g?: number
  threshold_b?: number
  threshold_grey?: number
}
