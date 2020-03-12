import {FilterData} from "../filter-data";
import {AbstractFilter, Services} from "./abstract-filter";
import DrawUtil from "../../utils/draw-util";
import {FilterHelper} from "./filter-helper";
import {map} from "rxjs/operators";
import {Point} from "../../model/point";

export class HistogramFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number = 0, channel: number = 0, histogramOptions?: HistogramOptions) {
    return map((data: FilterData) => {
      const source = this.getImage(sourcePos, data);

      let target = null;

      if (histogramOptions.targetPos)
        target = this.getImage(histogramOptions.targetPos, data);

      if (source === null)
        throw new Error(`Images not found, images loaded: ${data.imgStack.length}, first image position ${sourcePos}. <br> Image position has to 0 <= position < ${data.imgStack.length}`);

      if (channel < 0 || channel > 2)
        throw new Error(`Channel r = 0, g = 1, b = 2`);

      if (!histogramOptions.bins)
        histogramOptions.bins = 256;

      const totalValues = 256;

      const sourceImage = FilterHelper.imageToPNG(source);
      const result = new Array<number>(histogramOptions.bins).fill(0);

      const binValue = Math.floor(histogramOptions.bins / totalValues);
      let i = 0;
      for (let y = 0; y < sourceImage.height; y++) {
        for (let x = 0; x < sourceImage.width; x++) {
          const bin = sourceImage.data[i + channel] * binValue;
          result[bin] += 1;
          i += 4;
        }
      }

      console.log(sourceImage);
      console.log(result);

      if (target) {
        const canvas = FilterHelper.createCanvas(1200, 500);
        const max = result.reduce((a, b) => a > b ? a : b);
        HistogramFilter.drawHistogram(canvas, result, canvas.width, canvas.height, -1, histogramOptions.bins);
        FilterHelper.canvasToImage(canvas, target);
      }

      data.setData(histogramOptions.targetData, result);
      return data;
    });
  }

  public static drawHistogram(canvas: HTMLCanvasElement, data: Array<number>, width: number = -1, height: number = -1, maxBarHeight: number = -1, bins: number = 265) {

    if (height === -1)
      height = canvas.height;

    if (width === -1)
      width = canvas.width;

    const cx = FilterHelper.get2DContext(canvas);
    const totalValues = 256;
    const barWidth = Math.floor((width - 2) / bins);
    const drawHeight = height - 20;

    if (maxBarHeight === -1)
      maxBarHeight = data.reduce((a, b) => a > b ? a : b);

    DrawUtil.drawRect(cx, 0, 0, width, drawHeight, "#cccccc", false);
    DrawUtil.drawPolygon(cx, [new Point(0, drawHeight + 1), new Point(0, drawHeight + 5)], barWidth, "#000");
    DrawUtil.drawText(cx, "0", 0, height, "16px Arial", "#000");
    DrawUtil.drawPolygon(cx, [new Point(width / 2 - barWidth / 2, drawHeight + 1), new Point(width / 2 - barWidth / 2, drawHeight + 5)], barWidth, "#000");
    DrawUtil.drawText(cx, "127", width / 2 - 16, height, "16px Arial", "#000");
    DrawUtil.drawPolygon(cx, [new Point(width - barWidth, drawHeight + 1), new Point(width - barWidth, drawHeight + 5)], barWidth, "#000");
    DrawUtil.drawText(cx, "254", width - 27, height, "16px Arial", "#000");

    for (let i = 0; i < data.length; i++) {
      const tmpHeight = (data[i] * (drawHeight - 2)) / maxBarHeight;
      DrawUtil.drawRect(cx, 1 + i * barWidth, drawHeight - 1 - tmpHeight, barWidth, tmpHeight, "#000");
    }
  }
}

export interface HistogramOptions {
  targetPos?: number
  targetDisplayMinValue?: number
  targetDisplayMaxValue?: number
  targetData?: string
  bins?: number
}
