import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {ProcessCountedPixelsOptions} from "./process-counted-pixels-filter";

export class OutputFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter() {
    return map((data: FilterData) => {
      this.services.processCallback.displayData(data.output);
      return data;
    });
  }
}
