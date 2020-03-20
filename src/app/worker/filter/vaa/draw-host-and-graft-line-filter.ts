import {AbstractFilter, Services} from "../abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../../filter-data";
import {ComplexLine} from "../../../utils/vaa/model/complex-line";
import DrawUtil from "../../../utils/draw-util";
import {FilterHelper} from "../filter-helper";
import {Point} from "../../../model/point";

export class DrawHostAndGraftLineFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourceName: string, drawHostAndGraftLineOptions?: DrawHostAndGraftLineOptions) {
    return map((data: FilterData) => {
      const lines = data.getData(sourceName);

      if (!drawHostAndGraftLineOptions)
        drawHostAndGraftLineOptions = {};

      if (!drawHostAndGraftLineOptions.color)
        drawHostAndGraftLineOptions.color = "#fff";

      if (!drawHostAndGraftLineOptions.size)
        drawHostAndGraftLineOptions.size = 1;

      if (drawHostAndGraftLineOptions.targetPos == null)
        drawHostAndGraftLineOptions.targetPos = -1;

      if (!drawHostAndGraftLineOptions.connectSingleLines)
        drawHostAndGraftLineOptions.connectSingleLines = true;

      const target = this.getImage(drawHostAndGraftLineOptions.targetPos, data);

      if (!lines || !(lines instanceof ComplexLine))
        throw new Error(`DrawHostAndGraftLineFilter: Line not found ${sourceName}`);

      if (!target)
        throw new Error(`DrawHostAndGraftLineFilter: TargetImage not found at ${drawHostAndGraftLineOptions.targetPos}`);

      const canvas = FilterHelper.imageToCanvas(target);
      const cx = FilterHelper.get2DContext(canvas);

      let endOfLastLine: Point = null;

      for (let line of lines.lines) {
        DrawUtil.drawPolygon(cx, line.getPoints(), drawHostAndGraftLineOptions.size, drawHostAndGraftLineOptions.color, false, false, false);
        if (endOfLastLine) {
          DrawUtil.drawPolygon(cx, [endOfLastLine, line.getFirstPoint()], drawHostAndGraftLineOptions.size, drawHostAndGraftLineOptions.color, false, false, false);
        }
        endOfLastLine = line.getLastPoint();
      }

      FilterHelper.canvasToImage(canvas, target);

      return data;
    });
  }
}


export interface DrawHostAndGraftLineOptions {
  color?: string;
  targetPos?: number;
  size?: number;
  connectSingleLines?: boolean;
}
