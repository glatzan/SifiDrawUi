import {Line} from "./line";
import {Vector} from "./vector";
import VectorUtils from "../../vector-utils";

export class ComplexLine implements Line {

  id: string;
  length: number;
  lines: Line[] = [];

  constructor()
  constructor(id: string)
  constructor(id?: string) {
    this.id = id;
  }

  getFirstPoint(): Vector {
    return this.lines[0].getFirstPoint();
  }

  getLastPoint(): Vector {
    return this.lines[this.lines.length - 1].getLastPoint();
  }

  public addLine(line: Line, reverse: boolean = false, atStart: boolean = false) {
    if (reverse) {
      line.reverse();
    }

    if (atStart) {
      this.lines.splice(0, 0, line);
    } else {
      this.lines.push(line);
    }

    this.length += line.length;
  }

  public addLines(lines: Line[]) {
    for (let i = 0; i < lines.length; i++) {
      this.addLine(lines[i]);
    }
  }

  public reverse() {
    this.lines.reverse();
    this.lines.forEach(x => x.reverse());
  }

  public hasPoints(): boolean {
    return this.lines != null && this.lines.length > 0;
  }

  public countLines() {
    return this.lines.length;
  }

  public setLine(index: number, line: Line) {
    this.lines[index] = line;
  }

  public getLine(index: number): Line {
    return this.lines[index];
  }

  public getPoints(): Vector[] {
    let result: Vector[] = []
    for (let line of this.lines) {
      for (let p of line.getPoints())
        result.push(p);
    }
    return result;
  }

  public getDirectionVector(): Vector {
    return VectorUtils.directionVector(this.getFirstPoint(), this.getLastPoint());
  }

}
