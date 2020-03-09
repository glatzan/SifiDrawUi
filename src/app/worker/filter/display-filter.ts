import {AbstractFilter, Services} from "./abstract-filter";
import {flatMap} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {Observable} from "rxjs";

export class DisplayFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number = -1) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {

      if (sourcePos === -1)
        sourcePos = data.imgStack.length - 1;

      if (sourcePos < 0 || sourcePos >= data.imgStack.length) {
        observer.error(`Clone Image out of bounds IMG ${sourcePos}`);
      }

      this.services.displayCallback.displayCallBack(data.imgStack[sourcePos]);

      observer.next(data);
      observer.complete();
    }));
  }
}
