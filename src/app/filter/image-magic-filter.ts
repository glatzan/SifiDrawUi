import {ImageFilter} from "./image-filter";
import {ImageMagicService} from "../service/image-magic.service";
import DrawUtil from "../utils/draw-util";
import {CImage} from "../model/cimage";
import {Filter} from "./filter";

export class ImageMagicFilter extends ImageFilter {

  private command: string

  imageMagicService: ImageMagicService;

  constructor(parentFilter: ImageFilter, command: string) {
    super(parentFilter);
    this.command = command;
  }

  doFilter(data: HTMLImageElement, parentFilter: Filter) {
    const baseImg = DrawUtil.imgToBase64(data, x => {
      const c = new CImage();
      c.data = x;
      c.name = "tmp"
      c.id = "tmp"
      c.layers = [];

      this.imageMagicService.performMagic(c, this.command).subscribe(y => {
        DrawUtil.loadImageFromBase64(y.data, z => {
          super.doFilter(z, this);
        })
      })
    })
  }
}
