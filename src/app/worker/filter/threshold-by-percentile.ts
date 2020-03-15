import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";
import {HistogramData} from "./histogram-filter";
import {ColorType} from "pngjs";

export class ThresholdByPercentile extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, targetPos: number, thresholdPercentileOptions?: ThresholdPercentileOptions) {
    return map((data: FilterData) => {
      if (thresholdPercentileOptions === undefined)
        thresholdPercentileOptions = {};

      if (!thresholdPercentileOptions.thresholdPercentile)
        thresholdPercentileOptions.thresholdPercentile = 0.5;

      if (!thresholdPercentileOptions.histogramSource)
        thresholdPercentileOptions.histogramSource = "histogram";

      if (!thresholdPercentileOptions.targetData)
        thresholdPercentileOptions.targetData = "thresholdPercentileData";

      const histogram = data.getData(thresholdPercentileOptions.histogramSource) as HistogramData;

      const [source, target] = this.getSourceAndTarget(data, sourcePos, targetPos);

      if (!target)
        throw new Error(`Target not found index ${targetPos}!`);

      if (!histogram)
        throw Error("Histogram not found!");

      const resultData = new ThresholdPercentileData();
      resultData.totalPixels = histogram.count;
      resultData.threshold = thresholdPercentileOptions.thresholdPercentile;
      resultData.computedTargetThresholdCount = histogram.count * thresholdPercentileOptions.thresholdPercentile;

      let sumPixelsBelowThreshold = 0;
      let thresholdPixelValue = 0;

      for (let i = 0; i < histogram.data.length; i++) {
        sumPixelsBelowThreshold += histogram.data[i];

        if (sumPixelsBelowThreshold > resultData.computedTargetThresholdCount)
          break;

        thresholdPixelValue = i;
      }

      resultData.thresholdPixelValue = thresholdPixelValue;
      resultData.aboveThresholdPixels = resultData.totalPixels - sumPixelsBelowThreshold;
      resultData.belowThresholdPixels = sumPixelsBelowThreshold;

      let result = "Ergebniss Threshold by Percentile <br>";
      result+= `Total Pixels: ${resultData.totalPixels} <br>`;
      result+= `Threshold Percentile ${resultData.threshold} <br>`;
      result+= `Threshold PixelTarget: ${resultData.computedTargetThresholdCount} <br>`;
      result+= `Threshold Pixel Value: ${resultData.thresholdPixelValue} <br>`;
      result+= `Pixels above Threshold: ${resultData.aboveThresholdPixels} <br>`;
      result+= `Pixels below Threshold: ${resultData.belowThresholdPixels} <br>`;
      result+= `Pixels above Threshold Percent: ${resultData.aboveThresholdPixels/resultData.totalPixels} <br>`;
      result+= `Pixels below Threshold Percent: ${resultData.belowThresholdPixels/resultData.totalPixels} <br>`;

      data.output += result;

      const sourceImage = FilterHelper.imageToPNG(source);
      const targetImage = FilterHelper.createPNG(sourceImage.width, sourceImage.height,4);

      for (let x = 0; x < sourceImage.width; x++) {
        for (let y = 0; y < sourceImage.height; y++) {
          const idx = (sourceImage.width * y + x) << 2;

          if (sourceImage.data[idx] <= thresholdPixelValue) {
            targetImage.data[idx] = 0;
            targetImage.data[idx + 1] = 0;
            targetImage.data[idx + 2] = 0;
            targetImage.data[idx + 3] = 0;
          } else {
            targetImage.data[idx] = sourceImage.data[idx];
            targetImage.data[idx + 1] = sourceImage.data[idx + 1];
            targetImage.data[idx + 2] = sourceImage.data[idx + 2];
            targetImage.data[idx + 3] = sourceImage.data[idx + 3];
          }
        }
      }

      FilterHelper.pngToImage(targetImage, target, 4);
      return data;
    });
  }
}

export interface ThresholdPercentileOptions {
  histogramSource?: string
  thresholdPercentile?: number
  targetData?: string
}

export class ThresholdPercentileData {
  totalPixels: number;
  threshold: number;
  computedTargetThresholdCount: number;
  aboveThresholdPixels: number;
  belowThresholdPixels: number;
  thresholdPixelValue: number;
}
