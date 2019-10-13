import {CImage} from "../model/cimage";

export class FilterData {
  public imgStack: CImage[] = [];
  public origName: string;
  public batchSize: number;
  public numberInBatch: number;

  public additionalData: any;

  public pushIMG(img: CImage) {
    this.imgStack.push(img);
  }

  public popIMG() {
    this.imgStack.splice(-1, 1)
  }

  public getImg(index: number = this.imgStack.length - 1): CImage {
    return this.imgStack[index];
  }

  public setImg(img: CImage) {
    if (this.imgStack.length == 0) {
      this.pushIMG(img);
    } else {
      this.imgStack[this.imgStack.length - 1] = img;
    }
  }
}
