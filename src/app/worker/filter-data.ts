import {CImage} from "../model/cimage";
import {PointLine} from "../model/point-line";

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
    if (selectImage)
      this.img = img
  }

  public setData(data: any, key: string) {
    this.dataStack.set(key, data)
  }

  public getData(key: string): any {
    return this.dataStack.get(key);
  }


  public popIMG() {
    this.imgStack.splice(-1, 1)
  }

}
