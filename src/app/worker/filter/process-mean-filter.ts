import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";

export class ProcessMeanFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourceData = "mean_data") {
    return map((data: FilterData) => {

      const means = data.getData(sourceData);

      if (!means)
        throw new Error(`ProcessThresholdSurfaces: Data not found (${sourceData}) or data length is not valid (2)`);

      let result = "Ergebniss <br>";

      for (const mean of means) {
        result += `Mean of IMG ${mean.source}: <br>`;
        result += `Counted Pixels ${mean.pixelCount}: <br>`;
        result += `Mean of Counted Pixels ${mean.meanValue}: <br>`;
        result += `Ignored Pixels ${mean.ignoredPixel}: <br>`;
        result += `<br>`;
      }

      data.output += result;
      return data;
    });
  }
}
