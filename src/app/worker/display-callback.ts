import {SImage} from "../model/SImage";

export interface DisplayCallback {
  displayCallBack(image: SImage): void;
  addImage(image : SImage) : void;
}
