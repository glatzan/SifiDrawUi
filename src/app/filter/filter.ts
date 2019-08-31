export class Filter {

  public name: string;

  public parentFilter: Filter;
  public childFilter: Filter;

  protected constructor(filter: Filter) {
    if (filter !== undefined)
      filter.registerChildFilter(this);
  }

  doFilter(data, parentFilter: Filter) {

  }

  public registerChildFilter(filter: Filter) {
    this.childFilter = filter;
    if (filter !== null)
      filter.parentFilter = this;
  }
}
