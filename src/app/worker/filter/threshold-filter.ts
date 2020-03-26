import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";

export class ThresholdFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, thresholdOptions?: ThresholdOptions) {
    return map((data: FilterData) => {
      if (thresholdOptions === undefined)
        thresholdOptions = {};

      const [r, rs, g, gs, b, bs] = this.getThreshold(thresholdOptions);

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
            if (!rs && sourceImage.data[idx] < r)
              c = false;
            else if (rs && sourceImage.data[idx] > r)
              c = false;
          }

          if (g != -1) {
            if (!gs && sourceImage.data[idx + 1] < g)
              c = false;
            else if (gs && sourceImage.data[idx + 1] > g)
              c = false;
          }

          if (b != -1) {
            if (!bs && sourceImage.data[idx + 2] < b)
              c = false;
            else if (bs && sourceImage.data[idx + 2] > b)
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
          } else {
            if (target) {
              targetImage.data[idx] = 0;
              targetImage.data[idx + 1] = 0;
              targetImage.data[idx + 2] = 0;
              targetImage.data[idx + 3] = 0;
            }
          }
        }
      }

      if (target) {
        FilterHelper.pngToImage(targetImage, target)
      }

      const entry = {tag: sourcePos.toString(), name: source.name, value: counter};
      data.pushData(thresholdOptions.targetData, entry);

      return data;
    });
  }

  protected getThreshold(threshold: ThresholdOptions): [number, boolean, number, boolean, number, boolean] {
    let [r, rs, g, gs, b, bs] = [-1, false, -1, false, -1, false];

    if (threshold.threshold_grey) {
      r = threshold.threshold_grey;
      rs = threshold.threshold_grey_smaller == null ? false : threshold.threshold_grey_smaller
    } else {
      r = threshold.threshold_r !== null ? threshold.threshold_r : -1;
      rs = threshold.threshold_r_smaller == null ? false : threshold.threshold_r_smaller;
      g = threshold.threshold_g !== null ? threshold.threshold_g : -1;
      gs = threshold.threshold_g_smaller == null ? false : threshold.threshold_g_smaller;
      b = threshold.threshold_b !== null ? threshold.threshold_b : -1;
      bs = threshold.threshold_b_smaller == null ? false : threshold.threshold_b_smaller;
    }

    return [r, rs, g, gs, b, bs]
  }
}

export interface ThresholdOptions {
  targetData?: string
  targetImagePos?: number
  threshold_r?: number
  threshold_r_smaller?: boolean
  threshold_g?: number
  threshold_g_smaller?: boolean
  threshold_b?: number
  threshold_b_smaller?: boolean
  threshold_grey?: number
  threshold_grey_smaller?: boolean
}
