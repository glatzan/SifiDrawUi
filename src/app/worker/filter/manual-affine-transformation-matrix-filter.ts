import {AbstractFilter, Services} from "./abstract-filter";
import {FilterData} from "../filter-data";
import {fromObject, fromTriangles} from "transformation-matrix";
import {map} from "rxjs/operators";
import {Point} from "../../model/point";

export class ManualAffineTransformationMatrixFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(t1: Point[], t2: Point[], targetDataName = 'manualAffineMatrix') {
    return map((data: FilterData) => {

      if (t1.length < 3 || t2.length < 3) {
        throw new Error(`Triangles must contain 3 points;`);
      }
      const affine = fromTriangles(t1.slice(0, 3), t2.slice(0, 3));
      data.setData(targetDataName, affine);
      return data;
    });
  }
}
