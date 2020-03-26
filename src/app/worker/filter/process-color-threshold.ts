import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";

export class ProcessColorThreshold extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourceData = "countData") {
    return map((data: FilterData) => {

      const counts = data.getData(sourceData);

      if (!counts || counts.length !== 6)
        throw new Error(`ProcessThresholdSurfaces: Data not found (${sourceData}) or data length is not valid (2)`);

      let result = "Ergebniss <br>";
      result += `ID: ${counts[0].tag} &emsp;  Total Pixels: ${counts[0].value}<br>`;
      result += `ID: ${counts[1].tag} &emsp;  Red Pixels: ${counts[1].value}<br>`;
      result += `ID: ${counts[2].tag} &emsp;  Total Pixels: ${counts[2].value}<br>`;
      result += `ID: ${counts[3].tag} &emsp;  Red Pixels: ${counts[3].value}<br>`;
      result += `ID: ${counts[4].tag} &emsp;  Total Pixels: ${counts[4].value}<br>`;
      result += `ID: ${counts[5].tag} &emsp;  Red Pixels: ${counts[5].value}<br><br>`;

      const totalRed = counts[1].value + counts[3].value + counts[5].value;

      result += `Total red Pixels: ${totalRed}<br>`;
      result += `ID: ${counts[1].tag} &emsp;  Red Percent: ${counts[1].value/totalRed}<br>`;
      result += `ID: ${counts[3].tag} &emsp;  Red Percent: ${counts[3].value/totalRed}<br>`;
      result += `ID: ${counts[5].tag} &emsp;  Red Percent: ${counts[5].value/totalRed}<br>`;

      data.output += result;
      return data;
    });
  }
}

export interface ProcessCountedPixelsOptions {
  sourceData?: string
  pixelInMM?: number
}
