import {AbstractFilter, Services} from "./abstract-filter";
import {flatMap, map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import DrawUtil from "../../utils/draw-util";
import {FilterHelper} from "./filter-helper";

export class JPGToPNGConverterFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, targetPos: number = sourcePos) {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(this.getImage(sourcePos, data)).pipe(map(canvas => {

      const target = this.getImage(targetPos, data);

      if (!target) {
        return data;
      }

      FilterHelper.updateImageFromCanvas(target, canvas);
      return data;
    })));
  }
}
