import {CImage} from "../model/cimage";

export interface DisplayCallback {
  displayCallBack(image: CImage): void;
}
