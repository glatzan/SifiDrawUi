import {ComplexLine} from "./model/complex-line";
import {HostParabola} from "./host-parabola";
import {Line} from "./model/line";
import DrawUtil from "../draw-util";
import VectorUtils from "../vector-utils";
import {Vector} from "./model/vector";

export class GraftFinder {

  public static removeUnlikelyLines(lines: ComplexLine, parabola: HostParabola, canvas): ComplexLine {
    const resultLine = new ComplexLine();
    console.log(lines)
    console.log("hallo " + lines.lines.length)
    for (let line of lines.lines) {
      if (GraftFinder.isWithinParabola(line, parabola, canvas)) {
        resultLine.addLine(line)
      }
    }

    console.log(resultLine);
    return resultLine;
  }

  public static joinLines(lines: ComplexLine, parabola: HostParabola, canvas) {
    const resultLine = new ComplexLine();

    if(lines.length === 0)
      return resultLine;

    let countedLiens = 1;

    let tmp = new ComplexLine();
    tmp.addLine(lines.getLine(0))

    for (let i = 1; i < lines.lines.length; i++) {
      if (lines.infos[i].distancePrevLine > 40) {

        const firstD = GraftFinder.lineExtensionDistance(lines.lines[i - 1], false, lines.lines[i].getFirstPoint(), 3, "blue", canvas);
        const secontD = GraftFinder.lineExtensionDistance(lines.lines[i], true, lines.lines[i - 1].getLastPoint(), 3, "orange", canvas);

        const firstsD = GraftFinder.lineExtensionDistance(lines.lines[i - 1], false, lines.lines[i].getFirstPoint(),2, "blue", canvas);
        const secontsD = GraftFinder.lineExtensionDistance(lines.lines[i], true, lines.lines[i - 1].getLastPoint(), 2, "orange", canvas);

        console.log("Distance: ")
        console.log(firstD + " " + secontD)

        if (!(secontD.distanceToPoint < 30 && secontD.distanceOfLine < 300) && !(firstD.distanceToPoint < 30 && firstD.distanceOfLine < 300) && !(secontsD.distanceToPoint < 30 && secontsD.distanceOfLine < 300) && !(firstsD.distanceToPoint < 30 && firstsD.distanceOfLine < 300)) {
          resultLine.addLine(tmp);
          tmp = new ComplexLine();
        }

      }
      tmp.addLine(lines.getLine(i))
    }

    resultLine.addLine(tmp);

    for (let l of resultLine.lines) {
      DrawUtil.drawPointLinesOnCanvas(canvas, l.getPoints(), "green", 5, false);
    }

    console.log(resultLine);
    return resultLine;
  }

  private static lineExtensionDistance(line: Line, start: boolean, to: Vector, pointDistanceLineVector: number, color, canvas): { point: Vector, distanceToPoint: number, distanceOfLine: number } {
    console.log("Big Distance" + line.id)
    console.log(line)
    console.log(to)

    let indexOfPoint = line.getPoints().length > 2 ? pointDistanceLineVector : 2;
    indexOfPoint = start ? indexOfPoint - 1 : line.getPoints().length - indexOfPoint;

    const startPoint = start ? line.getFirstPoint() : line.getLastPoint();
    const secondPoint = line.getPoints()[indexOfPoint];

    const dirVector = VectorUtils.directionVector(secondPoint, startPoint)
    const nearestPoint = VectorUtils.nearestLinePointDistance(startPoint, dirVector, to);

    DrawUtil.drawPoint(canvas, secondPoint, "red", 10);
    DrawUtil.drawPoint(canvas, nearestPoint, color, 5);
    DrawUtil.drawPointLineOnCanvas(canvas, startPoint, nearestPoint, color, 2);

    return {
      point: nearestPoint,
      distanceToPoint: VectorUtils.distance(to, nearestPoint),
      distanceOfLine: VectorUtils.distance(start ? line.getFirstPoint() : line.getLastPoint(), nearestPoint)
    };
  }

  public static isWithinParabola(line: Line, parabola: HostParabola, canvas): boolean {
    const firstLine = parabola.getNormalPointAtLine(line.getFirstPoint());
    const lastPoint = parabola.getNormalPointAtLine(line.getLastPoint());

    DrawUtil.drawPointLineOnCanvas(canvas, line.getFirstPoint(), firstLine, "red", 1, false);
    DrawUtil.drawPointLineOnCanvas(canvas, line.getLastPoint(), lastPoint, "red", 1, false);

    const dirV1 = VectorUtils.directionVector(firstLine, line.getFirstPoint());
    const dirV2 = VectorUtils.directionVector(lastPoint, line.getLastPoint());

    const x = (dirV1.x + dirV2.x) / 2;
    const y = (dirV1.y + dirV2.y) / 2;

    const first = VectorUtils.distance(line.getFirstPoint(), firstLine);
    const second = VectorUtils.distance(line.getLastPoint(), lastPoint);

    const distance = (first + second) / 2;

    console.log(x + " " + y);
    console.log(distance);

    if (y > 0) {
      DrawUtil.drawPointLineOnCanvas(canvas, line.getFirstPoint(), line.getLastPoint(), "red", 5, false);
      return false;
    }

    if (distance > 300) {
      DrawUtil.drawPointLineOnCanvas(canvas, line.getFirstPoint(), line.getLastPoint(), "red", 5, false);
      return false;
    }

    return true;
  }
}
