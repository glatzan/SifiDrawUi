import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";
import DrawUtil from "../../utils/draw-util";
import {ColorType} from "pngjs";

export class DrawLayerFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, layerIDs: [string], targetPos: number = sourcePos, drawLayerOptions?: DrawLayerOptions) {
    return map((data: FilterData) => {

        const [source, target] = this.getSourceAndTarget(data, sourcePos, targetPos);

        if (!drawLayerOptions)
          drawLayerOptions = {};

        if (!target)
          throw new Error(`DrawLayerFilter: TargetImage not found index ${targetPos}!`);

        let layers = [];

        if (layerIDs === null) {
          layers = source.layers
        } else {
          layerIDs.forEach(layer => {
            const result = FilterHelper.findLayer(source.layers, layer);
            if (result) {
              layers.push(result);
            }
          })
        }

        let canvas = null;

        canvas = FilterHelper.base64StringToCanvas(target.data);

        const cx = FilterHelper.get2DContext(canvas);

        layers.forEach(layer => {
          DrawUtil.drawLayer(cx, layer, false, drawLayerOptions.color ? drawLayerOptions.color : layer.color, drawLayerOptions.size ? drawLayerOptions.size : layer.size);
        });

        FilterHelper.canvasToImage(canvas, target);
        return data;
      }
    );
  }
}


export interface DrawLayerOptions {
  color?: string;
  size?: number;
}
