import {AbstractFilter, Services} from "./abstract-filter";
import {flatMap} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {Observable} from "rxjs";
import {FilterHelper} from "./filter-helper";
import {ColorType} from "pngjs";

export class CreateImageFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(createImageOptions?: CreateImageOptions) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {

      if (!createImageOptions)
        createImageOptions = {};

      if (!createImageOptions.backgroundColor)
        createImageOptions.backgroundColor = "#000";


      if (!createImageOptions.colorType)
        createImageOptions.colorType = 0;


      if (createImageOptions.referenceImagePos) {
        const refIMG = this.getImage(createImageOptions.referenceImagePos, data);
        if (refIMG) {
          createImageOptions.width = refIMG.width || 1000;
          createImageOptions.height = refIMG.height || 1000;
        }
      }

      if (createImageOptions.width === -1 || !createImageOptions.width)
        createImageOptions.width = data.img.width || 1000;

      if (createImageOptions.height == -1 || !createImageOptions.height)
        createImageOptions.height = data.img.height || 1000;

      const newImage = FilterHelper.createNewImage(createImageOptions.width, createImageOptions.height, createImageOptions.backgroundColor);
      this.pushAndAddImageToStack(newImage, data);

      observer.next(data);
      observer.complete();
    }));
  }
}

export interface CreateImageOptions {
  width?: number;
  height?: number;
  referenceImagePos?: number;
  colorType?: ColorType;
  backgroundColor?: string;
}
