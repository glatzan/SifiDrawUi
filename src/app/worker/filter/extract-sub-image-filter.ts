import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import DrawUtil from "../../utils/draw-util";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";
import {ColorType} from "pngjs";

export class ExtractSubImageFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, extractionLayerID: string, targetPos: number = -1) {
    return map((data: FilterData) => {

      const [source, target] = this.getSourceAndTarget(data, sourcePos, targetPos);

      if (!target)
        throw new Error(`Target not found index ${targetPos}!`);

      const sourceCanvas = FilterHelper.base64StringToCanvas(source.data);

      const extractionLayer = FilterHelper.findLayer(source.layers, extractionLayerID);

      if (!extractionLayer)
        throw new Error(`Extraction Layer not found, ID not valid: ${targetPos}!`);

      const targetCanvas = FilterHelper.createCanvas(sourceCanvas.width, sourceCanvas.height);
      const targetCX = FilterHelper.get2DContext(targetCanvas);
      DrawUtil.drawRect(targetCX, 0, 0, sourceCanvas.width, sourceCanvas.height, "rgba(0, 0, 0, 0)");
      extractionLayer.lines.forEach(line => {
        if (line.length > 2) {
          targetCX.save();
          DrawUtil.drawPolygon(targetCX, line, 1, "#fff", true, false, true);
          targetCX.drawImage(sourceCanvas, 0, 0, targetCanvas.width, targetCanvas.height, 0, 0, targetCanvas.width, targetCanvas.height);
          targetCX.restore();
        }
      })


      // DrawUtil.drawPolygon(targetCX, extractionLayer.lines[2], 1, "#fff", true, false, true);
      // targetCX.drawImage(sourceCanvas, 0, 0, targetCanvas.width, targetCanvas.height, 0, 0, targetCanvas.width, targetCanvas.height);
      FilterHelper.canvasToImage(targetCanvas, target);
      return data;
    });
  }
}
