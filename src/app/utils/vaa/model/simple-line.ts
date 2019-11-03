import {Line, Orientation} from "./line";
import {Vector} from "./vector";
import VectorUtils from "../../vector-utils";

export class SimpleLine implements Line {

  id: string;
  length: number;
  points: Vector[] = [];

  constructor(id ?: string, length?: number) {
    this.id = id;
    this.length = length;
  }

  public add(x: number, y: number);
  public add(x: number, y: number, pos: number);
  public add(x: number, y: number, pos?: number) {
    this.addPoint(new Vector(x, y, pos));
  }

  public addPoint(vector: Vector) {
    this.points.push(vector);
  }

  public getFirstPoint(): Vector {
    return this.points[0];
  }

  public getLastPoint(): Vector {
    return this.points[this.points.length - 1];
  }

  public reverse() {
    this.points.reverse();
  }

  public hasPoints(): boolean {
    return this.points != null && this.points.length > 0;
  }

  public getPoints(): Vector[] {
    return this.points;
  }

  getDirectionVector(): Vector
  getDirectionVector(orientation: Orientation): Vector
  getDirectionVector(orientation?: Orientation): Vector {
    return VectorUtils.directionVector(this.getFirstPoint(), this.getLastPoint());
  }
}
