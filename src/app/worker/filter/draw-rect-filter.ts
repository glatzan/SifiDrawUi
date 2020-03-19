import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";
import DrawUtil from "../../utils/draw-util";

export class DrawRectFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, color = "#000", x = 0, y = 0, width = -1, height = -1) {
    return map((data: FilterData) => {

      const [source, target] = this.getSourceAndTarget(data, sourcePos, null);

      const canvas = FilterHelper.base64StringToCanvas(source.data);
      const cx = FilterHelper.get2DContext(canvas);

      height = height < 0 ? canvas.height : height;
      width = width < 0 ? canvas.width : width;

      DrawUtil.drawRect(cx, x, y, width, height, color);

      FilterHelper.canvasToImage(canvas, source);
      return data
    })
  }
}


