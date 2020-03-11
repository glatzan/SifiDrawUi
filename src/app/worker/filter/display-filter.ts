import {AbstractFilter, Services} from "./abstract-filter";
import {FilterData} from "../filter-data";
import {map} from "rxjs/operators";

export class DisplayFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number = -1) {
    return map((data: FilterData) => {

      if (sourcePos === -1)
        sourcePos = data.imgStack.length - 1;

      if (sourcePos < 0 || sourcePos >= data.imgStack.length) {
        throw new Error(`Clone Image out of bounds IMG ${sourcePos}`);
      }

      this.services.displayCallback.displayCallBack(data.imgStack[sourcePos]);

      return data;
    });
  }
}
