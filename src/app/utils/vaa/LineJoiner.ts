import {ComplexLine} from "./model/complex-line";
import VectorUtils from "../vector-utils";
import {Line} from "./model/line";
import {Vector} from "./model/vector";

export class LineJoiner {

  public static joinComplexLine(line: ComplexLine, maxDistance: number): ComplexLine {

    return line;
  }

  public static joinLines(lines: Line[], maxDistance: number): Line[] {
    const result: Line[] = [];

    while (lines.length != 0) {
      console.log(`-> Start Elements ${lines.length} Results ${result.length}`);
      const res = LineJoiner.join(lines.pop(), lines, maxDistance, 0);
      result.push(res[0]);
      lines = res[1];
      console.log(`-> End Elements ${lines.length} Results ${result.length}`)
    }

    return result;
  }

  public static join(firstLine: Line, lines: Line[], maxDistance: number, depth: number, minJoinAngle: number = 0.5): [Line, Array<Line>] {

    console.log("Reclusive " + depth);
    let longestLine: [Line, Array<Line>] = null;

    for (let secondLine of lines) {
      const distance = LineJoiner.findShortestDistance(firstLine, secondLine, maxDistance);
      if (distance != null) {
        console.log("Line" + distance.firstLine.id + " / " + distance.secondLine.id);
        const intersectionVector = LineJoiner.getIntersectionVector(distance.firstLine, distance.secondLine, distance.secondLineOrientation);
        const intersectionVectorFirst = VectorUtils.angle(distance.firstLine.getDirectionVector(), intersectionVector);
        const intersectionVectorSecond = VectorUtils.angle(distance.secondLine.getDirectionVector(), intersectionVector);

        console.log(`Direction Vector first/intersection -> ${intersectionVectorFirst}, second/intersection -> ${intersectionVectorFirst}`);

        if (intersectionVectorFirst < minJoinAngle || intersectionVectorSecond < minJoinAngle)
          continue;

        const newComplexLine = new ComplexLine(distance.firstLine.id + "-" + distance.secondLine.id);
        newComplexLine.addLines(LineJoiner.orderLines(distance.firstLine, distance.secondLine, distance.secondLineOrientation));

        // copy the line Array and remove the second line from it
        const clonedLines = LineJoiner.removeLineFormArrayByIndex(distance.secondLine, Object.assign([], lines));
        console.log("Calling recursive with " + newComplexLine.id);

        const recursiveLine = this.join(newComplexLine, clonedLines, maxDistance, depth + 1);

        if (longestLine === null || recursiveLine[0].length > longestLine[0].length) {
          longestLine = recursiveLine;
        }
      }
    }

    if (longestLine === null)
      return [firstLine, lines];
    else
      return longestLine;
  }

  private static removeLineFormArrayByIndex(line: Line, lines: Line[]): Line[] {
    for (let line of lines) {
      if (line.id === line.id) {
        const index = lines.indexOf(line);
        if (index !== -1) {
          console.log("Removing second line");
          lines.splice(index, 1);
          return lines;
        }
      }
    }
    return lines;
  }

  private static orderLines(firstLine: Line, secondLine: Line, secondLinePosition: Orientation): Line[] {
    if (secondLinePosition === Orientation.FirstPoint) {
      return [firstLine, secondLine];
    } else {
      return [secondLine, firstLine];
    }
  }

  private static getIntersectionVector(firstLine: Line, secondLine: Line, secondLinePosition: Orientation): Vector {
    if (secondLinePosition === Orientation.FirstPoint) {
      return VectorUtils.directionVector(firstLine.getLastPoint(), secondLine.getFirstPoint())
    } else {
      return VectorUtils.directionVector(secondLine.getLastPoint(), firstLine.getFirstPoint())
    }
  }

  private static findShortestDistance(firstLine: Line, secondLine: Line, maxDistance: number): LineDistance {
    let result: LineDistance = new LineDistance(firstLine, secondLine);

    let distance = VectorUtils.distance(firstLine.getFirstPoint(), secondLine.getFirstPoint());
    // console.log(`Distance ${dist}  ${firstLine.id} ${l2.id} - First - Last`)
    if (distance < maxDistance && distance < result.distance) {
      result.setData(distance, Orientation.FirstPoint, Orientation.FirstPoint);
    }

    distance = VectorUtils.distance(firstLine.getFirstPoint(), secondLine.getLastPoint());
    // console.log(`Distance ${dist}  ${firstLine.id} ${l2.id} - First - Last`)
    if (distance < maxDistance && distance < result.distance) {
      result.setData(distance, Orientation.FirstPoint, Orientation.LastPoint);
    }

    distance = VectorUtils.distance(firstLine.getLastPoint(), secondLine.getFirstPoint());
    // console.log(`Distance ${dist}  ${firstLine.id} ${l2.id} - Last - First`)
    if (distance < maxDistance && distance < result.distance) {
      result.setData(distance, Orientation.LastPoint, Orientation.FirstPoint);
    }

    distance = VectorUtils.distance(firstLine.getLastPoint(), secondLine.getLastPoint());
    // console.log(`Distance ${dist}  ${firstLine.id} ${l2.id} - Last - Last`)
    if (distance < maxDistance && distance < result.distance) {
      result.setData(distance, Orientation.LastPoint, Orientation.LastPoint);
    }

    return result.distance == Number.MAX_VALUE ? null : result;
  }
}

class LineDistance {
  distance = Number.MAX_VALUE;
  firstLine: Line;
  secondLine: Line;
  firstLineOrientation: Orientation;
  secondLineOrientation: Orientation;

  constructor(firstLine: Line, secondLine: Line) {
    this.firstLine = firstLine;
    this.secondLine = secondLine;
  }

  public setData(distance: number, firstLineOrientation: Orientation, secondLineOrientation: Orientation) {
    this.distance = distance;
    this.firstLineOrientation = firstLineOrientation;
    this.secondLineOrientation = secondLineOrientation;
  }
}

enum Orientation {
  FirstPoint, LastPoint
}
