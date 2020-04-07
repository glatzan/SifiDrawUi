import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {applyToPoints} from "transformation-matrix";
import {Point} from "../../model/point";

export class ApplyTransformationOnLayerFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, layers: [string], applyTransformationOnLayerOptions? : ApplyTransformationOnLayerOptions) {
    return map((data: FilterData) => {

      const [source, target] = this.getSourceAndTarget(data, sourcePos, null);

      if(!applyTransformationOnLayerOptions)
        applyTransformationOnLayerOptions= {};

      if(!applyTransformationOnLayerOptions.affineMatrixSource)
        applyTransformationOnLayerOptions.affineMatrixSource = "manualAffineMatrix";

      if(!applyTransformationOnLayerOptions.silent)
        applyTransformationOnLayerOptions.silent = false;

      if (!layers || layers.length <= 0)
        throw new Error(`ApplyTransformationOnLayerFilter: No Layer provided!`);


      const affineMatrix = data.getData(applyTransformationOnLayerOptions.affineMatrixSource);

      if (!affineMatrix)
        throw new Error(`ApplyTransformationOnLayerFilter: No affine Matrix provided!`);

      layers.forEach(x => {
        let found = false;
        for (const lay of source.layers) {
          if (lay.id === x) {
            for (const {item, index} of lay.lines.map((item, index) => ({item, index}))) {
              const tmp = applyToPoints(affineMatrix, item);
              lay.lines[index] = tmp.map(x => {
                // @ts-ignore
                return new Point(Math.round(x.x), Math.round(x.y));
              });
            }
            found = true;
            break;
          }
        }
        if (!found && !applyTransformationOnLayerOptions.silent)
          throw new Error(`Layer not found!  ID: ${x}`);
      });
      return data;

    });
  }
}


export interface ApplyTransformationOnLayerOptions {
  affineMatrixSource?: string
  silent?: boolean
}
