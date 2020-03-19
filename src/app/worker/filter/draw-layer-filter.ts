import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";
import DrawUtil from "../../utils/draw-util";

export class DrawLayerFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, layerIDs: [string], targetPos: number = sourcePos) {
    return map((data: FilterData) => {

        const [source, target] = this.getSourceAndTarget(data, sourcePos, targetPos);

        if (!target)
          throw new Error(`DrawLayerFilter: TargetImage not found index ${targetPos}!`);

        let layers = [];

        if (layerIDs === null) {
          layers = source.layers
        } else {
          layerIDs.forEach(layer => {
            const result = FilterHelper.findLayer(source.layers, layer);
            if (result !== undefined) {
              layers.push(result);
            }
          })
        }

        let canvas = null;

        canvas = FilterHelper.base64StringToCanvas(target.data);

        const cx = FilterHelper.get2DContext(canvas);

        layers.forEach(layer => {
          DrawUtil.drawLayer(cx, layer);
        });

        FilterHelper.canvasToImage(canvas, target);
        return data;
      }
    );
  }
}

