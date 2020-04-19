import {AbstractFilter, Services} from "./abstract-filter";
import {flatMap, map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {SImage} from "../../model/SImage";

export class SaveFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(targetDatasetID: string, saveOptions?: SaveOptions) {
    return flatMap((data: FilterData) => {

      if (saveOptions == null)
        saveOptions = {};

      let imgName = data.originalImage.name;

      if (data.originalImage.type == "group") {
        // remove last /
        imgName = data.originalImage.name.slice(0, data.originalImage.name.lastIndexOf("/") + 1);
      }

      const pathSplit = data.originalImage.path.split("/");

      if (pathSplit.length > 2) {
        if (saveOptions.addDatasetAsPrefix) {
          imgName = pathSplit[1] + "-" + imgName;
        }

        if (saveOptions.addProjectAsPrefix) {
          imgName = pathSplit[0] + "-" + imgName;
        }
      }


      if (saveOptions.imageSuffix !== undefined) {
        imgName = saveOptions.imageSuffix + imgName;
      }

      if (saveOptions.imagePrefix !== undefined) {
        imgName += saveOptions.imagePrefix;
      }

      let sourceImage = data.img;

      if (saveOptions.sourceImage !== undefined && this.getImage(saveOptions.sourceImage, data) !== null) {
        sourceImage = this.getImage(saveOptions.sourceImage, data);
      }

      const saveImage = Object.assign(new SImage(), sourceImage);
      saveImage.id = null;
      saveImage.concurrencyCounter = 0;
      saveImage.name = imgName;

      if (!saveOptions.saveLayers) {
        saveImage.layers = [];
      }

      return this.services.imageService.addImageToParent(saveImage, targetDatasetID, 'png').pipe(
        map(newImg => {
          return data;
        }));
    });
  }
}

export interface SaveOptions {
  addDatasetAsPrefix?: boolean
  addProjectAsPrefix?: boolean
  saveLayers?: boolean
  imageSuffix?: string
  imagePrefix?: string
  sourceImage?: number
}
