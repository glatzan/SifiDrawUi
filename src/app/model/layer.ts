import {Point} from './point';

export class Layer {
  id: number;
  points: Point[][];
  line: Point[];

  constructor(id: number)
  constructor(id: number, points?: Point[][]) {
    this.id = id;
    this.points = points || [];
    this.line = points && points[points.length - 1] || [];
  }

  public lastLine() {
    if (this.points.length === 0) {
      this.points[0] = [];
    }
    this.line = this.points[this.points.length - 1];
  }

  public newLine() {
    this.points[this.points.length] = [];
    this.line = this.points[this.points.length - 1];
  }
}
