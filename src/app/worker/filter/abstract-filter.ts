import {ImageService} from "../../service/image.service";
import {ImageGroupService} from "../../service/image-group.service";
import {ProcessCallback} from "../processCallback";
import {DisplayCallback} from "../display-callback";
import {CImage} from "../../model/CImage";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";

export class AbstractFilter {

  services: Services;

  constructor(services: Services) {
    this.services = services;
  }

  protected getImage(index: number, data: FilterData): CImage {
    if (index < -1 || index >= data.imgStack.length) {
      return null;
    }

    if (index === -1) {
      const img = FilterHelper.createNewImage(1, 1);
      this.pushAndAddImageToStack(img, data);
      return img;
    }

    return data.imgStack[index];
  }

  protected pushAndAddImageToStack(img: CImage, data: FilterData) {
    data.pushIMG(img);
    this.services.displayCallback.addImage(img);
  }

  protected getSourceAndTarget(data: FilterData, sourcePos: number, targetPos: number): [CImage, CImage] {
    const source = this.getImage(sourcePos, data);
    let target = null;
    if (targetPos != null) {
      if (targetPos === -1) {
        target = FilterHelper.createNewImage(source.width, source.height);
        this.pushAndAddImageToStack(target, data);
      } else {
        target = this.getImage(targetPos, data)
      }
    }

    if (source === null) {
      throw new Error(`Image not found index ${sourcePos}!`);
    }

    return [source, target];
  }
}


export class Services {
  public imageService: ImageService;

  public imageGroupService: ImageGroupService;

  public processCallback: ProcessCallback;

  public displayCallback: DisplayCallback;

  constructor(processCallback?: ProcessCallback, displayCallback?: DisplayCallback) {

    this.processCallback = processCallback || {
      callback(): void {
      }
    } as ProcessCallback;

    this.displayCallback = displayCallback || {
      displayCallBack(image: CImage): void {

      },
      addImage(image: CImage): void {

      }
    } as DisplayCallback
  }
}
