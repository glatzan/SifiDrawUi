import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {SImage} from "../../model/SImage";
import {FilterHelper} from "./filter-helper";
import CImageUtil from "../../utils/cimage-util";

export class CloneImageFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number) {
    return map((data: FilterData) => {
      const [source, target] = this.getSourceAndTarget(data, sourcePos, null);
      this.pushAndAddImageToStack(CImageUtil.prepareImage(FilterHelper.cloneImage(source)), data);
      return data
    })
  }
}


