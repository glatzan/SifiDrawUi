import {flatMap} from "rxjs/operators";
import {ICImage} from "../../model/ICImage";
import {FilterData} from "../filter-data";
import {AbstractFilter, Services} from "./abstract-filter";
import {ContrastOptions} from "../filter-core";
import {Observable} from "rxjs";

export class InitializeFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter() {
    return flatMap((data: ICImage) => new Observable<FilterData>((observer) => {
      const filterData = new FilterData();
      filterData.pushICIMG(data);
      filterData.originalImage = data;
      observer.next(filterData);
      observer.complete();
    }));
  }
}


