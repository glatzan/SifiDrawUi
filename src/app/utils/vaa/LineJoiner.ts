import {ComplexLine} from "./model/complex-line";
import VectorUtils from "../vector-utils";
import {Line, Orientation} from "./model/line";
import {Vector} from "./model/vector";
import DrawUtil from "../draw-util";

export class LineJoiner {

  public static joinComplexLine(line: ComplexLine, maxDistance: number, canvas): ComplexLine {
    const sortedLIne = new ComplexLine();
    sortedLIne.id = line.id;
    sortedLIne.addLines(this.joinLines( Object.assign([], line.lines), maxDistance, canvas));
    return sortedLIne;
  }

  public static joinLines(lines: Line[], maxDistance: number, canvas): Line[] {
    const result: Line[] = [];

    while (lines.length != 0) {
      console.log(`-> Start Elements ${lines.length} Results ${result.length}`);
      const res = LineJoiner.join(lines.splice(0,1)[0], lines, maxDistance, 0, canvas);
      result.push(res[0]);
      lines = res[1];
      console.log(`-> End Elements ${lines.length} Results ${result.length}`)
    }

    return result;
  }

  public static join(firstLine: Line, lines: Line[], maxDistance: number, depth: number, canvas, minJoinAngle: number = 0.5): [Line, Array<Line>] {

    console.log("Reclusive " + depth);
    let longestLine: [Line, Array<Line>] = null;

    for (let secondLine of lines) {
      const distance = LineJoiner.findShortestDistance(firstLine, secondLine, maxDistance);
      if (distance != null) {
        console.log("Line " + distance.firstLine.id + " / " + distance.secondLine.id);

        if(distance.secondLineOrientation === Orientation.LastPoint){
          console.error(`Second Line should be first point ${distance.firstLine.id} / ${distance.secondLine.id}`)
          continue;
        }

        const intersectionVector = LineJoiner.getIntersectionVector(distance.firstLine, distance.secondLine, distance.secondLineOrientation);
        const directDistance = distance.distance;
        const horizontalDistance = secondLine.getFirstPoint().x - firstLine.getLastPoint().x;
        const verticalDistance = firstLine.getLastPoint().y - secondLine.getFirstPoint().y;

        if(horizontalDistance < -5){
          console.log(distance)
          console.error(`Second Line left of first left ${distance.firstLine.id} / ${distance.secondLine.id} (${firstLine.getLastPoint().x}/${secondLine.getFirstPoint().x}) ${horizontalDistance}`)
          continue;
        }

        if(horizontalDistance < 20 && Math.abs(verticalDistance) > 15){
          console.error(`Second Line under/above first line ${distance.firstLine.id} / ${distance.secondLine.id}`)
          continue;
        }


        const intersectionVectorFirst = VectorUtils.angle(distance.firstLine.getDirectionVector(distance.firstLineOrientation), intersectionVector);
        const intersectionVectorSecond = VectorUtils.angle(distance.secondLine.getDirectionVector(distance.secondLineOrientation), intersectionVector);

        const ss = VectorUtils.angle(distance.firstLine.getDirectionVector(distance.firstLineOrientation), distance.secondLine.getDirectionVector(distance.secondLineOrientation));

        console.log(`Direction Vector first/intersection -> ${intersectionVectorFirst}, second/intersection -> ${intersectionVectorSecond}, TUT -> ${ss}`);

        if (ss < minJoinAngle) {
          console.error(`Abort angle : ${distance.firstLine.id} / ${distance.secondLine.id} angle: ${intersectionVectorFirst} / ${intersectionVectorSecond}`)
          if (canvas != null) {
            if (distance.secondLineOrientation == Orientation.FirstPoint)
              DrawUtil.drawPointLineOnCanvas(canvas, distance.firstLine.getLastPoint(), distance.secondLine.getFirstPoint(), "yellow", 1, false)
            else
              DrawUtil.drawPointLineOnCanvas(canvas, distance.firstLine.getFirstPoint(), distance.secondLine.getLastPoint(), "yellow", 1, false)
          }
          continue;
        }

        const newComplexLine = new ComplexLine(distance.firstLine.id + "-" + distance.secondLine.id);
        newComplexLine.addLines(LineJoiner.orderLines(distance.firstLine, distance.secondLine, distance.secondLineOrientation));

        // copy the line Array and remove the second line from it
        const clonedLines = LineJoiner.removeLineFormArrayByIndex(distance.secondLine,  Object.assign([], lines));
        console.log("Calling recursive with " + newComplexLine.id);

        const recursiveLine = this.join(newComplexLine, clonedLines, maxDistance, depth + 1, canvas);

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
    for (let l of lines) {
      if (l.id === line.id) {
        const index = lines.indexOf(l);
        if (index !== -1) {
          console.log(`Removing second line ${line.id} `);
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
      console.log(`First ${firstLine.id} / ${secondLine.id} => ${secondLinePosition} L / F`)
      return VectorUtils.directionVector(firstLine.getLastPoint(), secondLine.getFirstPoint())
    } else {
      console.log(`First ${firstLine.id} / ${secondLine.id} => ${secondLinePosition} F / L`)
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
