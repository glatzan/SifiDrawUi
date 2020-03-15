import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {ICImage} from "../../model/ICImage";
import {FilterData} from "../filter-data";

export class ProcessCountedPixelsFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(processCountedPixelsOptions?: ProcessCountedPixelsOptions) {
    return map((data: FilterData) => {
      if (!processCountedPixelsOptions)
        processCountedPixelsOptions = {};

      if (!processCountedPixelsOptions.sourceData)
        processCountedPixelsOptions.sourceData = "countData";

      if (!processCountedPixelsOptions.pixelInMM)
        processCountedPixelsOptions.pixelInMM = 1;

      const counts = data.getData(processCountedPixelsOptions.sourceData );

      let result = "Ergebniss <br>";

      console.log(processCountedPixelsOptions.pixelInMM)
      for (let count of counts) {
        result += `ID: ${count.tag} &emsp;  Value: ${count.value} &emsp; Volume: ${count.value * processCountedPixelsOptions.pixelInMM} mm2<br>`
      }

      data.output += result;
      return data;
    });
  }
}

export interface ProcessCountedPixelsOptions {
  sourceData?: string
  pixelInMM?: number
}
