import {ImageFilter} from "./image-filter";

export class ImageSplitFilter extends ImageFilter {

  private childFilters = new Array<ImageFilter>();

  doFilter(data: HTMLImageElement, parentFilter: Filter) {
    for (let filter of this.childFilters) {
      filter.doFilter(data, parentFilter);
    }
  }

  public registerChildFilter(filter: ImageFilter) {
    this.childFilters.push(filter)
    filter.parentFilter = this;
  }

}
