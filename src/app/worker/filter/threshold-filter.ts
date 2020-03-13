import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";
import {PNG} from "pngjs";

export class ThresholdFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, thresholdOptions?: ThresholdOptions) {
    return map((data: FilterData) => {
      if (thresholdOptions === undefined)
        thresholdOptions = {};

      let r, g, b = -1;

      if (thresholdOptions.threshold_grey) {
        r = thresholdOptions.threshold_grey;
      } else {
        r = thresholdOptions.threshold_r !== undefined ? thresholdOptions.threshold_r : -1;
        g = thresholdOptions.threshold_g !== undefined ? thresholdOptions.threshold_g : -1;
        b = thresholdOptions.threshold_b !== undefined ? thresholdOptions.threshold_b : -1;
      }

      if (!thresholdOptions.targetData)
        thresholdOptions.targetData = "countData";

      const source = this.getImage(sourcePos, data);
      const target = (thresholdOptions.targetImagePos) ? this.getImage(thresholdOptions.targetImagePos, data) : null;

      if (source === null) {
        throw new Error(`Image not found index ${sourcePos}!`);
      }

      const sourceImage = FilterHelper.imageToPNG(source);
      const targetImage = new PNG({width: sourceImage.width, height: sourceImage.height});

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
}

export interface ThresholdOptions {
  targetData?: string
  targetTag?: string
  threshold_r?: number
  threshold_g?: number
  threshold_b?: number
  threshold_grey?: number
  targetImagePos?: number
}
