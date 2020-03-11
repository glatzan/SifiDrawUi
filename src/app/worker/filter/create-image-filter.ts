import {AbstractFilter, Services} from "./abstract-filter";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";
import {ColorType} from "pngjs";
import {map} from "rxjs/operators";

export class CreateImageFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(createImageOptions?: CreateImageOptions) {
    return map((data: FilterData) => {

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

      return data;
    });
  }
}

export interface CreateImageOptions {
  width?: number;
  height?: number;
  referenceImagePos?: number;
  colorType?: ColorType;
  backgroundColor?: string;
}
