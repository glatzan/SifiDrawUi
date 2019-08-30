import {ImageFilter} from "./image-filter";

export class ImageMergeFilter extends ImageFilter {

  private parentFilters = new Array<{
    completed: boolean,
    filter: ImageFilter,
    resultData: HTMLImageElement
  }>();

  constructor(parentFilter: Array<ImageFilter>) {
    super(null);
    parentFilter.forEach(x => this.parentFilters.push({completed: false, filter: x, resultData: null}))
  }

  doFilter(data: HTMLImageElement, parentFilter: Filter) {
    let filterFound = false;
    let allFilterCompleted = true;

    for (let filter of this.parentFilters) {
      if (filter.filter == parentFilter) {
        filterFound = true;
        filter.completed = true;
        filter.resultData = data;
      }

      if (!filter.completed)
        allFilterCompleted = false;
    }

    if (allFilterCompleted)
      this.childFilter.doFilter(this.progressData(), this);
  }

  private progressData(): HTMLImageElement {
    return null;
  }
}
