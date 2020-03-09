import {Point} from '../model/point';
import {PointLine} from "../model/point-line";
import {Vector} from "./vaa/model/vector";
import {Equation, parse} from 'algebra.js';
import {Line} from "./vaa/model/line";
import {ComplexLine} from "./vaa/model/complex-line";
import {SimpleLine} from "./vaa/model/simple-line";

export default class VectorUtils {

  static standardDeviation(array: number[]) {
    let len = 0;
    let sum = array.reduce(function (pv, cv) {
      ++len;
      return pv + cv;
    }, 0);
    let mean = sum / len;
    let result = 0;
    for (let i = 0; i < len; i++)
      result += Math.pow(array[i] - mean, 2);
    len = (len == 1) ? len : len - 1;
    return Math.sqrt(result / len);
  }

  static mean(array: number[]) {
    let sum = array.reduce((pv, cv) => {
      return pv + cv;
    }, 0);
    return sum / array.length;
  }

  static angle(p1: Point, p2: Point) {
    return (p1.x * p2.x + p1.y * p2.y) / (Math.sqrt(Math.pow(p1.x, 2) + Math.pow(p1.y, 2)) * Math.sqrt(Math.pow(p2.x, 2) + Math.pow(p2.y, 2)))
  }

  static reducedDirectionVector(p1: PointLine): Point {
    return VectorUtils.directionVector(p1.getFirstPoint(), p1.getLastPoint());
  }


  static distance(p1: Point): number
  static distance(p1: Point, p2: Point): number
  static distance(p1: Point, p2?: Point): number {
    if (p2 === undefined)
      return Math.sqrt((p1.x) ** 2 + (p1.y) ** 2);
    else
      return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  }

  static directionVector(p1: Point, p2: Point): Point {
    const px = p1.x - p2.x;
    const py = p1.y - p2.y;
    return new Point(px, py);
  }

  static calculateNewPoint(p1: Point, p2: Point, targetLength: number, dirVec?: Point): Point {
    const dist = VectorUtils.distance(p1, p2);
    if (dist < targetLength) {
      const dirVect = !dirVec ? VectorUtils.directionVector(p1, p2) : dirVec;
      const f = 1 - dist / targetLength;
      return new Point(Math.round(p2.x - dirVect.x * f), Math.round(p2.y - dirVect.y * f));
    }
    return null;
  }

  static calculatePoint(p1: Point, dirVec: Point, offset: number): Point {
    return new Point(Math.round(p1.x - dirVec.x * offset), Math.round(p1.y - dirVec.y * offset));
  }

  static removeCollidingPointListsOfCircle(points: Point[][], origin: Point, radius: number): { lineIndex: number, points: Point[] }[] {
    let removedPoints = [];
    points.forEach((x, index) => {
      const res = VectorUtils.removeCollidingPointsOfCircle(x, origin, radius);
      if (res.length > 0) {
        removedPoints = removedPoints.concat({
          lineIndex: index,
          points: res
        })
      }
    });
    return removedPoints;
  }

  static removeCollidingPointsOfCircle(points: Point[], origin: Point, radius: number): Point[] {
    const removedPoints = [];
    points.forEach((x, index) => {
      if (this.distance(x, origin) < radius) {
        removedPoints.push(x);
        points.splice(index, 1);
      }
    });
    return removedPoints;
  }

  static movePointListsToCircleBoundaries(points: Point[][], origin: Point, radius: number, addHelperPoints: boolean = true): { lineIndex: number, oldPoints: Point[], newPoints: Point[] }[] {
    const movedPoints: { lineIndex: number, oldPoints: Point[], newPoints: Point[] }[] = [];
    for (let i = 0; i < points.length; i++) {
      const result = this.movePointsToCircleBoundaries(points[i], origin, radius);

      if (result && result.oldPoints.length > 0) {
        if (addHelperPoints)
          VectorUtils.updatePoints(points[i], result);
        movedPoints.push({lineIndex: i, oldPoints: result.oldPoints, newPoints: result.newPoints});
      }
    }

    return movedPoints;
  }

  static movePointsToCircleBoundaries(points: Point[], origin: Point, radius: number): { oldPoints: Point[], newPoints: Point[] } {
    let movedPoints: { oldPoints: Point[], newPoints: Point[] } = {oldPoints: [], newPoints: []};
    points.forEach((x, index, object) => {
      const tmpP = new Point(x.x, x.y, x.pos);
      const res = VectorUtils.calculateNewPoint(origin, x, radius);
      if (res != null) {
        res.pos = x.pos;
        movedPoints.oldPoints.push(x);
        movedPoints.oldPoints.push(res);
        object[index] = res;
      }
    });
    return movedPoints;
  }

  static updatePoints(points: Point[], movedPoints: { oldPoints: Point[], newPoints: Point[] }): boolean {
    let sections: { start: number, end: number }[] = [{start: movedPoints.newPoints[0].pos, end: movedPoints.newPoints[0].pos}];
    let currentIndex = 0;

    for (let i = 1; i < movedPoints.newPoints.length; i++) {
      if ((sections[currentIndex].end + 1) ===  movedPoints.newPoints[i].pos) {
        sections[currentIndex].end = movedPoints.newPoints[i].pos;
      } else {
        currentIndex++;
        sections[currentIndex] = {start: movedPoints.newPoints[i].pos, end: movedPoints.newPoints[i].pos};
      }
    }

    let indexOffset = 0;
    let change = false;

    sections.forEach(x => {
      let lowerBound = x.start + indexOffset - 6 > 0 ? x.start + indexOffset - 6 : 0;
      let upperBound = x.end + indexOffset + 5 < points.length - 1 ? x.end + indexOffset + 5 : points.length - 1;

      for (let y = lowerBound + 1; y < upperBound; y++) {
        let dist = VectorUtils.distance(points[y - 1], points[y]);

        if (dist < 7) {
          points.splice(y, 1);
          upperBound--;
          indexOffset--;
          change = true;
        } else if (dist > 15) {
          const dirVec = VectorUtils.directionVector(points[y - 1], points[y]);
          const newPoint = VectorUtils.calculatePoint(points[y - 1], dirVec, 0.5);

          points.splice(y, 0, newPoint);
          indexOffset++;
          upperBound++;
          change = true;
        } else {
        }
      }

    });

    return change;
  }

  static nearestLinePointDistance(startPoint: Vector, direction: Vector, point: Vector) {
    const x = startPoint.x - point.x;
    const y = startPoint.y - point.y;

    const formula = `(((${x})+(${direction.x})*t)*(${direction.x}))+(((${y})+(${direction.y})*t)*(${direction.y}))`;
    console.log(formula);
    try {
      const n1 = parse(formula);
      const quad = new Equation(n1, 0);
      const answers = quad.solveFor("t");
      console.log(answers)
      const factor = answers.numer / answers.denom;

      return new Vector(startPoint.x + direction.x * factor, startPoint.y + direction.y * factor);
    } catch (e) {
      console.error("error");
      console.error(e);
    }
  }

  static reduceLinePoints(line: Line, maxDistanceBetweenPoints: number) {
    if (line instanceof ComplexLine) {
      for (let l of line.lines)
        VectorUtils.reduceLinePoints(l, maxDistanceBetweenPoints);
    } else {
      if (line.getPoints().length <= 2)
        return;
      else {
        const resultArr = [];
        resultArr.push(line.getFirstPoint());

        for (let i = 0; i < line.getPoints().length; i++) {
          if (VectorUtils.distance(resultArr[resultArr.length - 1], line.getPoints()[i]) >= maxDistanceBetweenPoints) {
            resultArr.push(line.getPoints()[i])
          }
        }

        if(resultArr[resultArr.length-1] !== line.getLastPoint()){
          resultArr[resultArr.length-1] = line.getLastPoint();
        }

        (line as SimpleLine).points = resultArr;
      }

    }
  }

}

