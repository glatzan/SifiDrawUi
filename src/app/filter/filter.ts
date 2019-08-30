abstract class Filter {

  public name: string;

  public parentFilter: Filter;
  public childFilter: Filter;

  protected constructor(filter: Filter) {
    filter.registerChildFilter(this);
  }

  abstract doFilter(data, parentFilter: Filter);

  public registerChildFilter(filter: Filter) {
    this.childFilter = filter;
    if (filter !== null)
      filter.parentFilter = this;
  }
}
