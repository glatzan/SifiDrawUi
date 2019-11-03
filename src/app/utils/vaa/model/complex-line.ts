import {Line, Orientation} from "./line";
import {Vector} from "./vector";
import VectorUtils from "../../vector-utils";

export class ComplexLine implements Line {

  id: string;
  length: number = 0;
  lines: Line[] = [];
  infos: LineInformation[] = [];

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

  public getLines(): Line[] {
    return this.lines;
  }

  public addLine(line: Line, reverse: boolean = false, atStart: boolean = false) {
    if (reverse) {
      line.reverse();
    }

    const lineInfo = new LineInformation();
    let distanceToNext : number = 0;

    if (atStart) {
      if (this.lines != null && this.lines.length != 0) {
        distanceToNext = VectorUtils.distance(line.getLastPoint(), this.lines[0].getFirstPoint());
        lineInfo.distanceNextLine = distanceToNext;
        this.infos[0].distancePrevLine = distanceToNext;
      }

      this.lines.splice(0, 0, line);
      this.infos.splice(0, 0, lineInfo);
    } else {
      if (this.lines != null && this.lines.length != 0) {
        distanceToNext = VectorUtils.distance(this.lines[this.lines.length - 1].getLastPoint(), line.getFirstPoint());
        lineInfo.distancePrevLine = distanceToNext;
        this.infos[this.infos.length - 1].distanceNextLine = distanceToNext;
      }

      this.lines.push(line);
      this.infos.push(lineInfo);
    }

    this.length = +this.length + +line.length + +distanceToNext;
  }

  public addLines(lines: Line[]) {
    for (let line of lines) {
      this.addLine(line);
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

  getDirectionVector(): Vector
  getDirectionVector(orientation: Orientation): Vector
  getDirectionVector(orientation?: Orientation): Vector {
    if (orientation == null) {
      return VectorUtils.directionVector(this.getFirstPoint(), this.getLastPoint());
    } else if (orientation === Orientation.FirstPoint) {
      if (this.lines.length > 0) {
        return VectorUtils.directionVector(this.lines[0].getFirstPoint(), this.lines[0].getLastPoint())
      }
    } else {
      if (this.lines.length > 0) {
        const last = this.lines[this.lines.length - 1];
        return VectorUtils.directionVector(last.getFirstPoint(), last.getLastPoint())
      }
    }

    return null
  }
}

class LineInformation {
  distancePrevLine: number;
  distanceNextLine: number;
}
