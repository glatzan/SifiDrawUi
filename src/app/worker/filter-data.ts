import {ICImage} from '../model/ICImage';

export class FilterData {
  /**
   * Stack containing images to work with
   */
  public imgStack: ICImage[] = [];

  /**
   * Currently selected image
   */
  public img: ICImage;

  public origName: string;
  public batchSize: number;
  public numberInBatch: number;

  public dataStack: Map<string, any> = new Map<string, any>();

  public pushIMG(img: ICImage, selectImage: boolean = true) {
    this.imgStack.push(img);
    if (selectImage) {
      this.img = img;
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
