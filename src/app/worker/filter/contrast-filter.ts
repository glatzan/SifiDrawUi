import {PNG} from "pngjs";
import {AbstractFilter, Services} from "./abstract-filter";
import {FilterHelper} from "./filter-helper";
import {FilterData} from "../filter-data";
import {map} from "rxjs/operators";

export class ContrastFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, contrastOptions: ContrastOptions) {
    return map((data: FilterData) => {

      if (!contrastOptions)
        contrastOptions = {};
      if (!contrastOptions.targetPos)
        contrastOptions.targetPos = sourcePos;
      if (!contrastOptions.contrast)
        contrastOptions.contrast = 1;
      if (!contrastOptions.offset)
        contrastOptions.offset = 0;
      if (!contrastOptions.minValue)
        contrastOptions.minValue = 0;
      if (!contrastOptions.maxValue)
        contrastOptions.maxValue = 255;

      const source = this.getImage(sourcePos, data);
      const target = this.getImage(contrastOptions.targetPos, data);

      if (!source || !target) {
        throw new Error("Source or target not found!")
      }

      const sourceImage = FilterHelper.imageToPNG(source);
      const targetImage = new PNG({width: sourceImage.width, height: sourceImage.height});

      let [r, g, b,] = [0, 0, 0];
      let i = 0;
      for (let y = 0; y < sourceImage.height; y++) {
        for (let x = 0; x < sourceImage.width; x++) {
          if (contrastOptions.rgb) {
            r = ContrastFilter.calcValue(sourceImage.data[i], contrastOptions.minValue, contrastOptions.maxValue, contrastOptions.contrast, contrastOptions.offset);
            g = ContrastFilter.calcValue(sourceImage.data[i + 1], contrastOptions.minValue, contrastOptions.maxValue, contrastOptions.contrast, contrastOptions.offset);
            b = ContrastFilter.calcValue(sourceImage.data[i + 2], contrastOptions.minValue, contrastOptions.maxValue, contrastOptions.contrast, contrastOptions.offset);
          } else {
            r = ContrastFilter.calcValue(sourceImage.data[i], contrastOptions.minValue, contrastOptions.maxValue, contrastOptions.contrast, contrastOptions.offset);
            [g, b] = [r, r];
          }

          targetImage.data[i] = r > 255 ? 255 : r;
          targetImage.data[i + 1] = g > 255 ? 255 : g;
          targetImage.data[i + 2] = b > 255 ? 255 : b;
          targetImage.data[i + 3] = sourceImage.data[i + 3];
          i += 4;
        }
      }

      FilterHelper.pngToImage(targetImage, target);
      return data;
    });

  }

  private static calcValue(value: number, minValue: number, maxValue: number, contrast: number, offset: number) {
    const result = value * contrast * offset;
    if (result > maxValue)
      return maxValue;
    else if (result < minValue)
      return minValue;
    else
      return result;
  }
}

export interface ContrastOptions {
  targetPos?: number
  contrast?: number
  offset?: number;
  minValue?: number
  maxValue?: number
  rgb?: boolean;
}
