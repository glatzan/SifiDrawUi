import {PointLine} from "../model/point-line";
import {Point} from "../model/point";
import VectorUtils from "./vector-utils";
import {log} from "util";

export class PointLineUtil {

  public static orderLines(lines: PointLine[]): DistancePointContainer {
    const firstPair = PointLineUtil.findShortestDistanceBetweenLines(lines);

    PointLineUtil.orderLine(firstPair.line1, true, firstPair.data.startPointLine1);
    PointLineUtil.orderLine(firstPair.line2, false, firstPair.data.startPointLine2);

    lines = PointLineUtil.removeLineFromLineArray(firstPair.line1, lines);
    lines = PointLineUtil.removeLineFromLineArray(firstPair.line2, lines);

    const distancePoint = new DistancePointContainer(firstPair.line1, firstPair.line2, firstPair.data.distance);

    while (lines.length > 0) {
      let shortestDistanceToLine: { line2: PointLine, relation: NextLineData };

      for (let line of lines) {
        const tmp = PointLineUtil.getShortestDistBetweenLines(distancePoint.getFirstPoint(), distancePoint.getLastPoint(), PointLineUtil.getFirstPointOfLine(line), PointLineUtil.getLastPointOfLine(line))

        if (!shortestDistanceToLine || shortestDistanceToLine.relation.distance > tmp.distance) {
          shortestDistanceToLine = {
            line2: line,
            relation: tmp
          }
        }
      }

      if (shortestDistanceToLine) {
        if (shortestDistanceToLine.relation.startPointLine1 == Direction.FirstPoint) {
          distancePoint.addLine(shortestDistanceToLine.line2,shortestDistanceToLine.relation.distance, shortestDistanceToLine.relation.startPointLine2 === Direction.FirstPoint, true);
        } else {
          distancePoint.addLine(shortestDistanceToLine.line2, shortestDistanceToLine.relation.distance,shortestDistanceToLine.relation.startPointLine2 === Direction.LastPoint, false);
        }

        lines = PointLineUtil.removeLineFromLineArray(shortestDistanceToLine.line2, lines);
      }
    }

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
    NextLineData {

    let shortestDistance = new NextLineData(
      VectorUtils.distance(line1p1, line2p1),
      Direction.FirstPoint,
      Direction.FirstPoint
    );

    let tmp = VectorUtils.distance(line1p1, line2p2);
    if (tmp < shortestDistance.distance) {
      shortestDistance = {distance: tmp, startPointLine1: Direction.FirstPoint, startPointLine2: Direction.LastPoint};
    }

    tmp = VectorUtils.distance(line1p2, line2p1);
    if (tmp < shortestDistance.distance) {
      shortestDistance = {distance: tmp, startPointLine1: Direction.LastPoint, startPointLine2: Direction.FirstPoint};
    }

    tmp = VectorUtils.distance(line1p2, line2p2);
    if (tmp < shortestDistance.distance) {
      shortestDistance = {distance: tmp, startPointLine1: Direction.LastPoint, startPointLine2: Direction.LastPoint};
    }

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
        line.points.reverse();
      }
    } else {
      if (direction == Direction.LastPoint) {
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

export class DistancePointContainer {
  private lines: PointLine[] = [];
  private distance: number[] = [];

  constructor(line1: PointLine, line2: PointLine, distance: number) {
    this.lines.push(line1);
    this.lines.push(line2);
    this.distance.push(distance);
  }

  public getFirstPoint(): Point {
    return this.lines[0].points[0];
  }

  public getLastPoint(): Point {
    const points = this.lines[this.lines.length - 1].points;
    return points[points.length - 1];
  }

  public addLine(line: PointLine, distance: number, reverse: boolean, atStart: boolean) {
    if (reverse) {
      line.points.reverse();
    }

    if (atStart) {
      this.lines.splice(0, 0, line);
      this.distance.splice(0, 0, distance)
    } else {
      this.lines.push(line);
      this.distance.push(distance)
    }
  }

  public getLines(): PointLine[] {
    return this.lines;
  }

  public getLine(index: number) : PointLine{
    return this.lines[index];
  }

  public setLine(index: number, line: PointLine) {
    return this.lines[index] = line;
  }

  public getDistance(index: number): number {
    return this.distance[index];
  }
}

enum Direction {
  FirstPoint,
  LastPoint
}

/**
 * Class describing the relation between two lines
 */
class NextLineData {
  distance: number;
  startPointLine1: Direction;
  startPointLine2: Direction;

  constructor();
  constructor(distance: number,
              startPointLine1: Direction,
              startPointLine2: Direction)
  constructor(distance?: number,
              startPointLine1?: Direction,
              startPointLine2?: Direction) {
    this.distance = distance;
    this.startPointLine1 = startPointLine1;
    this.startPointLine2 = startPointLine2;
  }
}
