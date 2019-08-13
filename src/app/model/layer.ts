import {Point} from './point';

export class Layer {
  id: number;
  lines: Point[][];
  line: Point[];

  size: number = 1;
  color: string = '#ffffff';

  constructor(id: number)
  constructor(id: number, points?: Point[][]) {
    this.id = id;
    this.lines = points || [];
    this.line = points && points[(points.length - 1)];

    if (!points) {
      this.lines.push([]);
      this.line = this.lines[this.lines.length - 1];
    }
  }
}
