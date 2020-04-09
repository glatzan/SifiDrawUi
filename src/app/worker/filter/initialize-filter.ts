import {SAImage} from "../../model/SAImage";
import {FilterData} from "../filter-data";
import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";

export class InitializeFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter() {
    return map((data: SAImage) => {
      const filterData = new FilterData();
      filterData.pushICIMG(data);
      filterData.originalImage = data;
      return filterData
    });
  }
}


