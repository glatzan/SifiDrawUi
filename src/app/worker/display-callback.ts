import {CImage} from "../model/CImage";

export interface DisplayCallback {
  displayCallBack(image: CImage): void;
  addImage(imgae : CImage) : void;
}
