import DrawUtil from "../draw-util";
import {Point} from "../../model/point";
import {Vector} from "./model/vector";
import {ComplexLine} from "./model/complex-line";
import {Equation, parse} from 'algebra.js';
import CImageUtil from "../cimage-util";
import VectorUtils from "../vector-utils";

export class HostParabola {

  topPoint: Vector;
  compress: number = 0.001;

  constructor(topPoint: Vector, compress: number = 0.001) {
    this.topPoint = topPoint;
    this.compress = compress;
  }

  public drawParabola(canvas, {from = 0, last = 1350}: { from?: number; last?: number } = {}) {
    for (let x = from; x < last; x++) {
      let y = this.compress * (x - this.topPoint.x) ** 2 + this.topPoint.y;
      DrawUtil.drawPoint(canvas, new Point(x, y))
    }
  }

  public getY(x: number): number {
    return this.compress * (x - this.topPoint.x) ** 2 + this.topPoint.y;
  }

  public getX(y: number): Array<number> {
    const result = [];
    result.push(Math.sqrt((y - this.topPoint.y) / this.compress) + this.topPoint.x);
    result.push(-Math.sqrt((y - this.topPoint.y) / this.compress) + this.topPoint.x);
    return result;
  }

  public getNormalPointAtLine(vector: Vector) {
    const equation = `(-500/(x - ${this.topPoint.x}))*(%p.x%-x)+(${this.compress}*(x-${this.topPoint.x})*(x-${this.topPoint.x})+${this.topPoint.y})`;
    const equation1 = equation.replace("%p.x%", String(vector.x));
    try {
      const n1 = parse(equation1);
      const quad = new Equation(n1, vector.y);
      const answers = quad.solveFor("x");
      const y = this.getY(answers[0]);
      return new Vector(answers[0], y);
    } catch (e) {
      console.error(e);
    }
  }

  public distanceFromParabola(vector: Vector): number {
    const parabolaPoint = this.getNormalPointAtLine(vector);
    return VectorUtils.distance(vector, parabolaPoint);
  }

  public optimize(approximatedValues: Array<Vector>) {
    // const firstDistance = approximatedValues[0].x - this.getY()
    // console.log(approximatedValues[0])
    // console.log(approximatedValues[approximatedValues.length - 1]);
    // console.log(this.getX(approximatedValues[0].y));
    // console.log(approximatedValues[0].y);
  }

  public static findTopPointEndothelial(lines: ComplexLine, canvas, centerPoint: number = 675, horizontalRange: number = 50) {
    const result: number[] = new Array<number>(horizontalRange);
    result.fill(Number.MAX_VALUE)
    const start = centerPoint - Math.floor(horizontalRange / 2);
    const end = centerPoint + Math.floor(horizontalRange / 2);


    for (let line of lines.lines) {
      if (line.getFirstPoint().x < end) {
        console.log("Line - " + line.id)
        for (let point of line.getPoints()) {
          if (point.x >= start && point.x <= end) {

            const v = result[point.x - start]

            if (point.y < result[point.x - start]) {
              result[point.x - start] = point.y;
            }
          }
        }

      }
    }

    let count = 0;
    const value = result.reduce((a, b) => {
      if (b != Number.MAX_VALUE) {
        count++;
        return a + b;
      } else
        return a;
    })

    const y = value / count;

    DrawUtil.drawPointLineOnCanvas(canvas, new Point(start, y - 10), new Point(start, y + 10), "red", 1, false);
    DrawUtil.drawPointLineOnCanvas(canvas, new Point(end, y - 10), new Point(end, y + 10), "red", 1, false);
    DrawUtil.drawPointLineOnCanvas(canvas, new Point(start, y), new Point(end, y), "red", 1, false);

    return value / count;
  }

  public static paintLines(lines: ComplexLine, canvas, i: number = 0, level: number = 0, lastPoint: Vector = null): number {

    for (let l of lines.lines) {

      if (lastPoint != null) {
        DrawUtil.drawPointLineOnCanvas(canvas, lastPoint, l.getFirstPoint(), "blue", 3, false)
      }

      DrawUtil.drawPointLinesOnCanvas(canvas, l.getPoints(), CImageUtil.colors[i + 1], 3);
      DrawUtil.drawPoint(canvas, new Point(l.getFirstPoint().x, l.getFirstPoint().y), "Green", 4)
      DrawUtil.drawPoint(canvas, new Point(l.getLastPoint().x, l.getLastPoint().y), "Blue", 4)
      lastPoint = l.getLastPoint();
      // DrawUtil.text(canvas, `Line (${i}) ${l.id}`, new Point(l.getFirstPoint().x + 5, l.getFirstPoint().y + 5), "16px Arial", "DarkOrange")


      if (l.id.length === 3) {
        const dir = l.getDirectionVector();
        DrawUtil.text(canvas, `${l.id}`, new Point(l.getLastPoint().x + Math.round(dir.x / 2), l.getLastPoint().y + Math.round(dir.y / 2)), "16px Arial", "RED")
      }

      i++;

      if (l instanceof ComplexLine) {
        i = HostParabola.paintLines(l, canvas, i, level + 2, lastPoint);
      }

    }

    return i;
  }
}
