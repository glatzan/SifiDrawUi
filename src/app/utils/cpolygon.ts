export class CPolygon {
  x: number[] = [];
  y: number[] = [];
  size = 0;

  public reset() {
    this.size = 0;
  }

  public addPoint(x: number, y: number) {
    this.x.push(x);
    this.y.push(y);
    this.size += 1;
  }

  public copy(first?: number, last?: number) {
    if (!first) {
      first = 0;
    }

    if (!last) {
      last = this.size - 1;
    }

    const to = new CPolygon();

    for (let i = first; i <= last; i++) {
      to.addPoint(this.x[i], this.x[i]);
    }
    return to;
  }

}
