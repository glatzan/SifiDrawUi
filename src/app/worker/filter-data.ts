import {SAImage} from '../model/SAImage';
import {SImage} from "../model/SImage";
import {SImageGroup} from "../model/SImageGroup";

export class FilterData {
  /**
   * Stack containing images to work with
   */
  public imgStack: SImage[] = [];

  /**
   * Currently selected image
   */
  public img: SImage;

  public originalImage: SAImage;

  public batchSize: number;

  public numberInBatch: number;

  public dataStack: Map<string, any> = new Map<string, any>();

  public output: string = "";

  public pushIMG(img: SImage, selectImage: boolean = true) {
    this.imgStack.push(img);
    if (selectImage) {
      this.img = img;
    }
  }

  public pushICIMG(img: SAImage, selectImage: boolean = true) {
    if (img instanceof SImageGroup) {
      (img as SImageGroup).images.forEach(img => {
        this.imgStack.push(img);
      })
    } else {
      this.imgStack.push(img as SImage);
    }

    if (selectImage) {
      this.img = this.imgStack[0];
    }
  }

  public setData(key: string, data: any) {
    this.dataStack.set(key, data);
  }

  public getData(key: string): any {
    return this.dataStack.get(key);
  }

  public pushData(key: string, data: any) {
    const tmp = this.getData(key);
    if (this.getData(key)) {
      tmp.push(data);
    } else {
      this.setData(key, [data]);
    }
  }

  public popIMG() {
    this.imgStack.splice(-1, 1);
  }

}
