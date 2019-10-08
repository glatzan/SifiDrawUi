import {Point} from './point';

export class PointLine {

  id: string;
  points: Point[] = [];

  constructor(id ?: string) {
    this.id = id;
  }

  public add(x: number, y: number);
  public add(x: number, y: number, pos: number);
  public add(x: number, y: number, pos?: number) {
    this.addPoint(new Point(x, y, pos));
  }

  public addPoint(point: Point) {
    this.points.push(point);
  }

  public getFirstPoint() {
    return this.points[0];
  }

  public getLastPoint() {
    return this.points[this.points.length - 1];
  }
}
