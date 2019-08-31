import {ImageFilter} from "./image-filter";
import {Filter} from "./filter";
import DrawUtil from "../utils/draw-util";
import {CImage} from "../model/cimage";
import {EventEmitter} from "@angular/core";

export class ImageEventFilter extends ImageFilter {

  private readonly callBack: (image: CImage) => any;

  private readonly origImage: CImage;

  constructor(parentFilter: ImageFilter, callBack: (image: CImage) => any, origImg: CImage) {
    super(parentFilter);
    this.callBack = callBack;
    this.origImage = origImg;
  }

  doFilter(data: HTMLImageElement, parentFilter: Filter) {
    const baseImg = DrawUtil.imgToBase64(data, x => {
      this.origImage.data = x;
      console.log("Emitting final event")
      this.callBack(this.origImage);
    })
  }
}
