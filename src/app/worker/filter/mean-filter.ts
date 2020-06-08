import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";

export class MeanFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, targetData?: string) {
    return map((data: FilterData) => {
      const [source, target] = this.getSourceAndTarget(data, sourcePos, null);
      const sourceImage = FilterHelper.imageToPNG(source);

      if (!targetData) {
        targetData = "mean_data";
      }

      let lastValue = -1;
      let count = 0;
      let ignorePixel = 0;
      for (let x = 0; x < sourceImage.width; x++) {
        for (let y = 0; y < sourceImage.height; y++) {
          const idx = (sourceImage.width * y + x) << 2;

          if (sourceImage.data[idx + 3] != 0) {
            count++;
            lastValue += sourceImage.data[idx];

            // sourceImage.data[idx] = 0;
            // sourceImage.data[idx + 1] = 0;
            // sourceImage.data[idx + 2] = 0;
          } else {
            ignorePixel++;
          }
        }
      }

      console.log("Mean " + sourcePos);
      console.log(count);
      console.log(lastValue / count);
      console.log(ignorePixel);

      data.pushData(targetData, {
        source: sourcePos,
        pixelCount: count,
        meanValue: (lastValue / count),
        ignoredPixel: ignorePixel
      });

      // FilterHelper.pngToImage(sourceImage, target);

      return data;
    });
  }
}


