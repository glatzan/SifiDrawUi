import {ComplexLine} from "./model/complex-line";
import VectorUtils from "../vector-utils";
import {Line, Orientation} from "./model/line";
import {Vector} from "./model/vector";
import DrawUtil from "../draw-util";

export class RecuriveLineJoiner {

  public static joinComplexLine(line: ComplexLine, maxDistance: number, canvas, debug: boolean = false): ComplexLine {
    console.log(`# Join Lines`)
    const sortedLIne = new ComplexLine();
    sortedLIne.id = line.id;
    sortedLIne.addLines(this.joinLines(Object.assign([], line.lines), maxDistance, canvas, debug));
    return sortedLIne;
  }

  public static joinLines(lines: Line[], maxDistance: number, canvas, debug: boolean = false): Line[] {
    const result: Line[] = [];

    while (lines.length != 0) {
      console.log(`## Start Elements ${lines[0].id}`);
      const res = RecuriveLineJoiner.join(lines.splice(0, 1)[0], lines, maxDistance, 0, canvas, 0.5, debug);
      result.push(res[0]);
      lines = res[1];
    }

    return result;
  }

  public static join(firstLine: Line, lines: Line[], maxDistance: number, depth: number, canvas, minJoinAngle: number = 0.5, debug: boolean = false): [Line, Array<Line>] {


    let longestLine: [Line, Array<Line>] = null;

    let i = 0;

    for (let secondLine of lines) {
      const distance = RecuriveLineJoiner.findShortestDistance(firstLine, secondLine, maxDistance);

      if (debug)
        if (distance === null)
          console.error(`###${'#'.repeat(depth)}${i} Join Lines ${firstLine.id} -> ${secondLine.id} distance > ${maxDistance} (${VectorUtils.distance(firstLine.getLastPoint(), secondLine.getFirstPoint())})`);
        else
          console.log(`###${'#'.repeat(depth)}${i} Join Lines ${firstLine.id} -> ${secondLine.id} distance < ${maxDistance} (${VectorUtils.distance(firstLine.getLastPoint(), secondLine.getFirstPoint())})`);

      if (distance != null) {

        if (distance.secondLineOrientation === Orientation.LastPoint) {
          if (debug)
            console.error(`###${'#'.repeat(depth)}${i} - ${firstLine.id} / ${secondLine.id} Second Line should be first point`)
          continue;
        }

        const intersectionVector = RecuriveLineJoiner.getIntersectionVector(distance.firstLine, distance.secondLine, distance.secondLineOrientation);
        const directDistance = distance.distance;
        const horizontalDistance = secondLine.getFirstPoint().x - firstLine.getLastPoint().x;
        const verticalDistance = firstLine.getLastPoint().y - secondLine.getFirstPoint().y;

        if (horizontalDistance < -5) {
          if (debug)
            console.error(`###${'#'.repeat(depth)}${i} - ${firstLine.id} / ${secondLine.id} Second Line left of first left (${firstLine.getLastPoint().x}/${secondLine.getFirstPoint().x})(${horizontalDistance})`)
          continue;
        }

        if (horizontalDistance < 20 && Math.abs(verticalDistance) > 15) {
          if (debug)
            console.error(`###${'#'.repeat(depth)}${i} - ${firstLine.id} / ${secondLine.id} Second Line under/above first line (${firstLine.getLastPoint().x}/${secondLine.getFirstPoint().x})(${horizontalDistance})`)
          continue;
        }


        const intersectionVectorFirst = VectorUtils.angle(distance.firstLine.getDirectionVector(distance.firstLineOrientation), intersectionVector);
        const intersectionVectorSecond = VectorUtils.angle(distance.secondLine.getDirectionVector(distance.secondLineOrientation), intersectionVector);

        const ss = VectorUtils.angle(distance.firstLine.getDirectionVector(distance.firstLineOrientation), distance.secondLine.getDirectionVector(distance.secondLineOrientation));
        if (debug) {
          console.log(`###${'#'.repeat(depth)}${i} - ${firstLine.id} / ${secondLine.id} Direction Vector first/intersection  ${intersectionVectorFirst}`);
          console.log(`###${'#'.repeat(depth)}${i} - ${firstLine.id} / ${secondLine.id} Direction Vector first/intersection  ${intersectionVectorSecond}`);
          console.log(`###${'#'.repeat(depth)}${i} - ${firstLine.id} / ${secondLine.id} Direction Vector intersection  ${ss}`);
        }

        if (ss < minJoinAngle) {
          if (debug)
            console.error(`###${'#'.repeat(depth)}${i} - ${firstLine.id} / ${secondLine.id} Abort angle`)
          if (canvas != null) {
            DrawUtil.drawPointLineOnCanvas(canvas, distance.firstLine.getLastPoint(), distance.secondLine.getFirstPoint(), "yellow", 1, false)
          }
          continue;
        }

        const newComplexLine = new ComplexLine(distance.firstLine.id + "-" + distance.secondLine.id);
        newComplexLine.addLines(RecuriveLineJoiner.orderLines(distance.firstLine, distance.secondLine, distance.secondLineOrientation));

        // copy the line Array and remove the second line from it
        const clonedLines = RecuriveLineJoiner.removeLineFormArrayByIndex(distance.secondLine, Object.assign([], lines));

        const recursiveLine = this.join(newComplexLine, clonedLines, maxDistance, depth + 1, canvas, 0.5, debug);

        if (longestLine === null || recursiveLine[0].length > longestLine[0].length) {
          longestLine = recursiveLine;
          if (debug)
            console.log(`###${'#'.repeat(depth)}${i} !++ ${longestLine[0].id} new longest line ${longestLine[0].length}`);
        } else {
          if (debug)
            console.log(`###${'#'.repeat(depth)}${i} !-- ${recursiveLine[0].id} discard longest line ${recursiveLine[0].length}`);
        }
      }
      i++;
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
      // console.log(`First ${firstLine.id} / ${secondLine.id} => ${secondLinePosition} L / F`)
      return VectorUtils.directionVector(firstLine.getLastPoint(), secondLine.getFirstPoint())
    } else {
      // console.log(`First ${firstLine.id} / ${secondLine.id} => ${secondLinePosition} F / L`)
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
