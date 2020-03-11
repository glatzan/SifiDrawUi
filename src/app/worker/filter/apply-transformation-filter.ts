import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";

export class ApplyTransformationFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, targetPos: number = sourcePos, sourceData: string = "affineMatrix") {
    return map((data: FilterData) => {

      const source = this.getImage(sourcePos, data);
      const target = this.getImage(targetPos, data);

      if (source === null || target === null) {
        throw new Error(`Image not found index img 1 ${sourcePos} or target ${targetPos}!`);
      }

      const transformation = data.getData(sourceData);

      if (!!transformation) {
        throw new Error("Transformation Matrix not found!")
      }

      const sourceImage = FilterHelper.imageToPNG(source);

      const canvas = FilterHelper.base64StringToCanvas(source.data);
      const cx = FilterHelper.get2DContext(canvas);

      const canvasResult = FilterHelper.createCanvas(target.width, target.height);
      const cxResult = FilterHelper.get2DContext(canvasResult);

      cxResult.transform(transformation.a, transformation.b, transformation.c, transformation.d, transformation.e, transformation.f);
      cxResult.drawImage(canvas, 0, 0);

      FilterHelper.canvasToImage(canvasResult,target);

      return data;
    });
  }
}
