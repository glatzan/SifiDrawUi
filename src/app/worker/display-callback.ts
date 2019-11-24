import {CImage} from "../model/cimage";

export interface DisplayCallback {
  displayCallBack(image: CImage): void;
  addImage(imgae : CImage) : void;
}
