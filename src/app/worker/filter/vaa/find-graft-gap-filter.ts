import {AbstractFilter, Services} from "../abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../../filter-data";
import DrawUtil from "../../../utils/draw-util";
import {FilterHelper} from "../filter-helper";
import {Point} from "../../../model/point";

export class FindGraftGapFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, findGraftGapOption?: FindGraftGapOptions) {
    return map((data: FilterData) => {

      if(!findGraftGapOption)
        findGraftGapOption = {};

      if(findGraftGapOption.hostChanel == null)
        findGraftGapOption.hostChanel = 0;

      if(findGraftGapOption.graftChanel == null)
        findGraftGapOption.graftChanel = 1;

      if(findGraftGapOption.targetPos == null)
        findGraftGapOption.targetPos = -1;

      const [source, target] = this.getSourceAndTarget(data, sourcePos, findGraftGapOption.targetPos);

      if (!target)
        throw new Error(`FindGraftGapFilter: Target not found!`);

      const canvas = FilterHelper.imageToCanvas(target);
      const cx = FilterHelper.get2DContext(canvas);

      const sourceImg = FilterHelper.imageToPNG(source);

      for (let x = 0; x < sourceImg.width; x++) {
        let foundHost = -1;
        let foundGraft = -1;

        for (let y = 0; y < sourceImg.height; y++) {
          const idx = (sourceImg.width * y + x) << 2;

          if (sourceImg.data[idx] > 100) {
            foundHost = y;
          }

          if (sourceImg.data[idx + 1] > 100) {
            foundGraft = y;
          }
        }

        if (foundHost != -1 && foundGraft != -1 && foundHost < foundGraft) {
          for (let y = foundHost; y < foundGraft; y++) {
            DrawUtil.drawPointOnCanvas(cx, new Point(x,y),'blue', 1)
          }
        }
      }

      FilterHelper.canvasToImage(canvas,target);

      return data
    });
  }
}

export interface FindGraftGapOptions {
  targetPos?: number
  hostChanel?: number;
  graftChanel?: number
}

