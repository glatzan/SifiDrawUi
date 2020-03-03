import {ICImage} from '../model/ICImage';
import {CImage} from "../model/CImage";
import {CImageGroup} from "../model/CImageGroup";

export class FilterData {
  /**
   * Stack containing images to work with
   */
  public imgStack: CImage[] = [];

  /**
   * Currently selected image
   */
  public img: CImage;

  public origName: string;
  public batchSize: number;
  public numberInBatch: number;

  public dataStack: Map<string, any> = new Map<string, any>();

  public pushIMG(img: CImage, selectImage: boolean = true) {
    this.imgStack.push(img);
    if (selectImage) {
      this.img = img;
    }
  }

  public pushICIMG(img: ICImage, selectImage: boolean = true) {
    if (img instanceof CImageGroup) {
      (img as CImageGroup).images.forEach(img => {
        this.imgStack.push(img);
      })
    } else {
      this.imgStack.push(img as CImage);
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


  public popIMG() {
    this.imgStack.splice(-1, 1);
  }

}
