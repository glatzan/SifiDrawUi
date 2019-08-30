import {ImageFilter} from "./image-filter";

export class ImageMagicFilter extends ImageFilter {

  private command: string

  constructor(parentFilter: ImageFilter, command: string) {
    super(parentFilter);
    this.command = command;
  }

  doFilter(data: HTMLImageElement, parentFilter: Filter) {

    super.doFilter(data,parentFilter);
  }
}
