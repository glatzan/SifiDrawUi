export class ImageFilter extends Filter {

  constructor(parentFilter: ImageFilter) {
    super(parentFilter);
  }

  doFilter(data: HTMLImageElement, parentFilter: Filter) {
      this.childFilter.doFilter(data,parentFilter);
  }

}
