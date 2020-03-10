import {flatMap} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {Observable} from "rxjs";
import {AbstractFilter, Services} from "./abstract-filter";
import {PNG} from "pngjs";
import DrawUtil from "../../utils/draw-util";
import {FilterHelper} from "./filter-helper";

export class HistogramFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number = -1, channel: number = 0, histogramOptions?: HistogramOptions) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
      const source = this.getImage(sourcePos, data);

      let target = null;

      if (histogramOptions.targetPos)
        target = this.getImage(histogramOptions.targetPos, data);

      if (source === null) {
        observer.error(`Images not found, images loaded: ${data.imgStack.length}, first image position ${sourcePos}. <br> Image position has to 0 <= position < ${data.imgStack.length}`);
        return;
      }

      if (channel < 0 || channel > 2) {
        observer.error(`Channgel r = 0, g = 1, b = 2`);
      }

      const sourceBuffer = new Buffer(source.data, 'base64');
      const sourceImage = PNG.sync.read(sourceBuffer);

      const result = new Array<number>(256).fill(0);

      let i = 0;
      for (let y = 0; y < sourceImage.height; y++) {
        for (let x = 0; x < sourceImage.width; x++) {
          result[sourceImage.data[i + channel]] += 1;
          i += 4;
        }
      }

      if (target) {
        const canvas = FilterHelper.getCanvas(1200, 500)
        const cx = FilterHelper.get2DContext(canvas)

        const max = result.reduce((a, b) => a > b ? a : b);

        for (let i = 0; i < result.length; i++) {
          const height = (result[i] * 510) / max;
          DrawUtil.drawRect(cx, i * 2, 510 - height, 2, height, "#000");
        }

        target.data = DrawUtil.canvasAsBase64(canvas);
      }

      data.pushData(histogramOptions.targetData, result);
      observer.next(data);
      observer.complete();
    }));
  }
}

export interface HistogramOptions {
  targetPos?: number
  targetData?: string
  clipMin?: number
  clipMax?: number
  max?: number
}
