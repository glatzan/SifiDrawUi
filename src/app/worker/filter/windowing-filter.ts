import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";
import {PNG} from "pngjs";

export class WindowingFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, targetPos: number, windowingOptions: WindowingOptions) {
    return map((data: FilterData) => {

      if (!windowingOptions)
        windowingOptions = {};

      if (!windowingOptions.minValue)
        windowingOptions.minValue = 0;

      if (!windowingOptions.maxValue)
        windowingOptions.maxValue = 255;

      if(!windowingOptions.aMin)
        windowingOptions.aMin = 0;

      if(!windowingOptions.aMax)
        windowingOptions.aMax = 255;

      const source = this.getImage(sourcePos, data);
      const target = this.getImage(targetPos, data);

      if (!source || !target) {
        throw new Error("Source or target not found!")
      }

      const sourceImage = FilterHelper.imageToPNG(source);
      const targetImage = FilterHelper.createPNG(sourceImage.width,sourceImage.height);

      let [r, g, b,] = [0, 0, 0];
      let i = 0;
      for (let y = 0; y < sourceImage.height; y++) {
        for (let x = 0; x < sourceImage.width; x++) {

          if (windowingOptions.rgb) {
            r = WindowingFilter.calcValue(sourceImage.data[i], windowingOptions.minValue, windowingOptions.maxValue, windowingOptions.aMin, windowingOptions.aMax);
            g = WindowingFilter.calcValue(sourceImage.data[i + 1], windowingOptions.minValue, windowingOptions.maxValue, windowingOptions.aMin, windowingOptions.aMax);
            b = WindowingFilter.calcValue(sourceImage.data[i + 2], windowingOptions.minValue, windowingOptions.maxValue, windowingOptions.aMin, windowingOptions.aMax);
          } else {
            r = WindowingFilter.calcValue(sourceImage.data[i], windowingOptions.minValue, windowingOptions.maxValue, windowingOptions.aMin, windowingOptions.aMax);
            [g, b] = [r, r];
          }

          targetImage.data[i] = r;
          targetImage.data[i + 1] = g;
          targetImage.data[i + 2] = b;
          targetImage.data[i + 3] = sourceImage.data[i + 3];
          i += 4;
        }
      }

      FilterHelper.pngToImage(targetImage, target);
      return data;
    });
  }

  private static calcValue(value: number, minValue: number, maxValue: number, aMin: number, aMax: number) {
    const result = maxValue * ((value - aMin) / (aMax - aMin));
    if (result > maxValue)
      return maxValue;
    else if (result < minValue)
      return minValue;
    else
      return result;
  }
}

export interface WindowingOptions {
  aMin?: number
  aMax?: number
  minValue?: number
  maxValue?: number
  rgb?: boolean
}
