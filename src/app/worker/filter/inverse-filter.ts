import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";
import {ColorType} from "pngjs";

export class InverseFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, targetPos: number = sourcePos, inverseFilterOptions?: InverseFilterOptions) {
    return map((data: FilterData) => {

        if (!inverseFilterOptions)
          inverseFilterOptions = {};

        if (!inverseFilterOptions.colorType)
          inverseFilterOptions.colorType = 4;

        let [source, target] = this.getSourceAndTarget(data, sourcePos, targetPos);

        const sourceImage = FilterHelper.imageToPNG(source);
        const targetImage = FilterHelper.createPNG(sourceImage.width, sourceImage.height);

        for (let x = 0; x < sourceImage.width; x++) {
          for (let y = 0; y < sourceImage.height; y++) {
            const idx = (sourceImage.width * y + x) << 2;
            targetImage.data[idx] = 255 - sourceImage.data[idx];
            targetImage.data[idx + 1] = 255 - sourceImage.data[idx + 1];
            targetImage.data[idx + 2] = 255 - sourceImage.data[idx + 2];
            targetImage.data[idx + 3] = sourceImage.data[idx + 3];
          }
        }

        FilterHelper.pngToImage(targetImage, target, inverseFilterOptions.colorType);
        return data;
      }
    );
  }
}

export interface InverseFilterOptions {
  colorType?: ColorType
}
