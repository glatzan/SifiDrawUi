import {AbstractFilter, Services} from "../abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../../filter-data";
import {ComplexLine} from "../../../utils/vaa/model/complex-line";
import VectorUtils from "../../../utils/vector-utils";

export class ReducePointsByDistanceFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(distance: number = 10, lineData: string = "lines") {
    return map((data: FilterData) => {
      const sortedLines = data.getData(lineData);

      if (sortedLines instanceof ComplexLine) {
        console.log('Reduce Points');
        VectorUtils.reduceLinePoints(sortedLines, distance);
      } else {
        throw new Error(`ReducePointsByDistanceFilter: SourceData not found!`)
      }

      return data;
    });
  }
}
