export class Filter {

  public name: string;

  public parentFilter: Filter;
  public childFilter: Filter;

  public inputType : string;
  public outputType : string;

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
