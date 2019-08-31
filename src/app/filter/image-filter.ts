import {Filter} from "./filter";

export class ImageFilter extends Filter {

  protected result : HTMLImageElement;

  constructor(parentFilter: ImageFilter) {
    super(parentFilter);
  }

  doFilter(data: HTMLImageElement, parentFilter: Filter) {
    if (this.childFilter !== undefined)
      this.childFilter.doFilter(data, parentFilter);
  }

}
