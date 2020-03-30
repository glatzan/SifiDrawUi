import {AbstractFilter, Services} from "./abstract-filter";
import {flatMap, map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {CImageGroup} from "../../model/CImageGroup";
import {CImage} from "../../model/CImage";

export class SaveFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(targetProject: string, saveOptions?: SaveOptions) {
    return flatMap((data: FilterData) => {

      if (saveOptions == null)
        saveOptions = {};

      let fullImgName = atob(data.originalImage.id);
      let imgName = data.originalImage.name;

      if (data.originalImage instanceof CImageGroup) {
        // remove last /
        fullImgName = fullImgName.slice(0, -4);
        fullImgName = fullImgName.slice(0, fullImgName.lastIndexOf("/") + 1);
        fullImgName += data.originalImage.name
      } else {
        imgName = fullImgName.slice(fullImgName.lastIndexOf("/") + 1,-4);
      }

      const dataset = fullImgName.substr(0, fullImgName.lastIndexOf("/") + 1);

      let targetDataset = targetProject + "/processed";

      if (saveOptions.datasetMapping) {
        targetDataset = targetProject + "/" + saveOptions.datasetMapping;
      } else if (saveOptions.datasetsMapping) {
        for (let i = 0; i < saveOptions.datasetsMapping.length; i++) {
          if (dataset === saveOptions.datasetsMapping[i].dataset) {
            targetDataset = targetProject + "/" + saveOptions.datasetsMapping[i].mapping;
            break;
          }
        }
      }

      if (targetDataset.charAt(targetDataset.length - 1) !== '/') {
        targetDataset += "/"
      }


      let targetImgName = targetDataset;

      if (saveOptions.addDatasetAsPrefix) {
        targetImgName += dataset.split('/').join('-');
      }

      targetImgName += imgName;

      if (saveOptions.imageSuffix !== undefined) {
        targetImgName += saveOptions.imageSuffix;
      }

      if (!targetImgName.endsWith(".png"))
        targetImgName += ".png";

      let sourceImage = data.img;
      if (saveOptions.sourceImage !== undefined && this.getImage(saveOptions.sourceImage, data) !== null) {
        sourceImage = this.getImage(saveOptions.sourceImage, data);
      }

      const saveImage = Object.assign(new CImage(), sourceImage);
      saveImage.id = btoa(targetImgName);
      saveImage.name = targetImgName;

      if (!saveOptions.saveLayers) {
        saveImage.layers = [];
      }

      return this.services.imageService.createImage(saveImage, 'png').pipe(
        map(newImg => {
          return data;
        }));
    });
  }
}

export interface SaveOptions {
  datasetsMapping?: [{ dataset: string, mapping: string }]
  datasetMapping?: string
  addDatasetAsPrefix?: boolean
  saveLayers?: boolean
  imageSuffix?: string
  sourceImage?: number
}
