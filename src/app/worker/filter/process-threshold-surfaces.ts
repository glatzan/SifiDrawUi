import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";

export class ProcessThresholdSurfaces extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourceData = "countData") {
    return map((data: FilterData) => {

      const counts = data.getData(sourceData);

      if (!counts || counts.length !== 2)
        throw new Error(`ProcessThresholdSurfaces: Data not found (${sourceData}) or data length is not valid (2)`);

      let result = "Ergebniss <br>";

      for (let count of counts) {
        result += `ID: ${count.tag} &emsp;  Value: ${count.value}<br>`
      }

      const percent = counts[1].value * 100 / counts[0].value;

      result += `Percent: &emsp; ${percent}`;

      data.output += result;
      return data;
    });
  }
}

export interface ProcessCountedPixelsOptions {
  sourceData?: string
  pixelInMM?: number
}
