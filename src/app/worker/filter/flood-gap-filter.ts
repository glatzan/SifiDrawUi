import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";
import DrawUtil from "../../utils/draw-util";
import {Point} from "../../model/point";

export class FloodGapFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, floodGapOptions?: FloodGapOptions) {
    return map((data: FilterData) => {

      if (!floodGapOptions)
        floodGapOptions = {};

      if (!floodGapOptions.startChannel)
        floodGapOptions.startChannel = 0;

      if (!floodGapOptions.startValue)
        floodGapOptions.startValue = 255;

      if (!floodGapOptions.endChannel)
        floodGapOptions.endChannel = 1;

      if (!floodGapOptions.endColor)
        floodGapOptions.endColor = 255;

      if (!floodGapOptions.fillColor)
        floodGapOptions.fillColor = "blue";

      if (!floodGapOptions.targetPos)
        floodGapOptions.targetPos = sourcePos;

      const [source, target] = this.getSourceAndTarget(data, sourcePos, floodGapOptions.targetPos);

      if (!target)
        throw new Error(`DrawLayerFilter: TargetImage not found index ${floodGapOptions.targetPos}!`);

      const canvas = FilterHelper.imageToCanvas(target);
      const cx = FilterHelper.get2DContext(canvas);

      const sourceImg = FilterHelper.imageToPNG(source);

      for (let x = 0; x < sourceImg.width; x++) {
        let foundHost = -1;
        let foundGraft = -1;

        for (let y = 0; y < sourceImg.height; y++) {
          const idx = (sourceImg.width * y + x) << 2;

          if (sourceImg.data[idx+ floodGapOptions.startChannel] == floodGapOptions.startValue) {
            foundHost = y;
          }

          if (sourceImg.data[idx+ floodGapOptions.endChannel] == floodGapOptions.endColor) {
            foundGraft = y;
          }
        }

        if (foundHost != -1 && foundGraft != -1 && foundHost < foundGraft) {
          for (let y = foundHost; y < foundGraft; y++) {
            DrawUtil.drawPointOnCanvas(cx, new Point(x, y), floodGapOptions.fillColor, 1)
          }
        }
      }

      FilterHelper.canvasToImage(canvas, target);
      return data;
    });
  }
}

export interface FloodGapOptions {
  startChannel?: number;
  startValue?: number;
  endChannel?: number;
  endColor?: number;
  fillColor?: string
  targetPos?: number
}
