import {PointLine} from "../model/point-line";
import {Point} from "../model/point";
import VectorUtils from "./vector-utils";
import {log} from "util";

export class PointLineUtil {

  public static orderLines(lines: PointLine[]): DistancePointContainer {
    const firstPair = PointLineUtil.findShortestDistanceBetweenLines(lines);

    console.log(firstPair)

    PointLineUtil.orderLine(firstPair.line1, true, firstPair.data.startPointLine1);
    PointLineUtil.orderLine(firstPair.line2, false, firstPair.data.startPointLine2);

    lines = PointLineUtil.removeLineFromLineArray(firstPair.line1, lines);
    lines = PointLineUtil.removeLineFromLineArray(firstPair.line2, lines);


    const distancePoint = new DistancePointContainer(firstPair.line1, firstPair.line2);


    while (lines.length > 0) {
      let shortestDistanceToLine: { line2: PointLine, distance: number, direction1: Direction, direction2: Direction };

      for (let line of lines) {
        const tmp = PointLineUtil.getShortestDistBetweenLines(distancePoint.getFirstPoint(), distancePoint.getLastPoint(), PointLineUtil.getFirstPointOfLine(line), PointLineUtil.getLastPointOfLine(line))

        if (!shortestDistanceToLine || shortestDistanceToLine.distance > tmp.distance) {
          shortestDistanceToLine = {
            line2: line,
            distance: tmp.distance,
            direction1: tmp.startPointLine1,
            direction2: tmp.startPointLine2
          }
        }
      }

      if (shortestDistanceToLine) {
        // add new line bevore
        if (shortestDistanceToLine.direction1 == Direction.FirstPoint) {
          distancePoint.addLine(shortestDistanceToLine.line2, shortestDistanceToLine.direction2 === Direction.FirstPoint, true);
        } else {
          distancePoint.addLine(shortestDistanceToLine.line2, shortestDistanceToLine.direction2 === Direction.LastPoint, false);
        }

        lines = PointLineUtil.removeLineFromLineArray(shortestDistanceToLine.line2, lines);
      }
    }

    console.log(distancePoint);
    return distancePoint;
  }

  private static findShortestDistanceBetweenLines(lines: PointLine[]):
    { line1: PointLine, line2: PointLine, data: { distance: number, startPointLine1: Direction, startPointLine2: Direction } } {
    let distance: { line1: PointLine, line2: PointLine, data: { distance: number, startPointLine1: Direction, startPointLine2: Direction } };
    for (let i = 0; i < lines.length; i++) {
      for (let y = 1 + i; y < lines.length; y++) {

        const calc = PointLineUtil.getShortestDistBetweenLines(PointLineUtil.getFirstPointOfLine(lines[i]), PointLineUtil.getLastPointOfLine(lines[i]),
          PointLineUtil.getFirstPointOfLine(lines[y]), PointLineUtil.getLastPointOfLine(lines[y]));

        if (!distance || distance.data.distance > calc.distance) {
          distance = {line1: lines[i], line2: lines[y], data: calc}
        }
      }
    }
    return distance;
  }

  private static getShortestDistBetweenLines(line1p1: Point, line1p2: Point, line2p1: Point, line2p2: Point):
    { distance: number, startPointLine1: Direction, startPointLine2: Direction } {

    console.log("points")
    console.log(line1p1)
    console.log(line1p2)
    console.log(line2p1)
    console.log(line2p2)

    let shortestDistance = {
      distance: VectorUtils.distance(line1p1, line2p1),
      startPointLine1: Direction.FirstPoint,
      startPointLine2: Direction.FirstPoint
    };

    console.log("S_S " + shortestDistance.distance)

    let tmp = VectorUtils.distance(line1p1, line2p2);
    if (tmp < shortestDistance.distance) {
      shortestDistance = {distance: tmp, startPointLine1: Direction.FirstPoint, startPointLine2: Direction.LastPoint};
    }

    console.log("S_E " + tmp)

    tmp = VectorUtils.distance(line1p2, line2p1);
    if (tmp < shortestDistance.distance) {
      shortestDistance = {distance: tmp, startPointLine1: Direction.LastPoint, startPointLine2: Direction.FirstPoint};
    }

    console.log("E_S " + tmp)

    tmp = VectorUtils.distance(line1p2, line2p2);
    if (tmp < shortestDistance.distance) {
      shortestDistance = {distance: tmp, startPointLine1: Direction.LastPoint, startPointLine2: Direction.LastPoint};
    }

    console.log("E_E " + tmp)

    return shortestDistance;
  }

  private static getFirstPointOfLine(line: PointLine): Point {
    return line.points[0];
  }

  private static getLastPointOfLine(line: PointLine): Point {
    return line.points[line.points.length - 1]
  }

  private static orderLine(line: PointLine, p1: boolean, direction: Direction): PointLine {
    if (p1) {
      if (direction == Direction.FirstPoint) {
        console.log("reversing first")
        line.points.reverse();
      }
    } else {
      if (direction == Direction.LastPoint) {
        console.log("reversing second")
        line.points.reverse();
      }
    }

    return line;
  }

  private static removeLineFromLineArray(line: PointLine, lines: PointLine[]) {
    const result: PointLine[] = [];
    for (let tmp of lines) {
      if (tmp !== line)
        result.push(tmp);
    }
    return result;
  }
}

enum Direction {
  FirstPoint,
  LastPoint
}

export class DistancePointContainer {
  private lines: PointLine[] = [];

  constructor()
  constructor(line1: PointLine)
  constructor(line1: PointLine, line2: PointLine)
  constructor(line1?: PointLine, line2?: PointLine) {
    if (line1)
      this.lines.push(line1);
    if (line2)
      this.lines.push(line2)
  }

  public getFirstPoint(): Point {
    return this.lines[0].points[0];
  }

  public getLastPoint(): Point {
    const points = this.lines[this.lines.length - 1].points;
    return points[points.length - 1];
  }

  public addLine(line: PointLine, reverse: boolean, atStart: boolean) {
    if (reverse) {
      line.points = line.points.reverse();
    }


    if (atStart) {
      this.lines = this.lines.splice(0, 0, line);
    } else {
      this.lines.push(line);
    }
  }

  public getLines(): PointLine[] {
    return this.lines;
  }

}

