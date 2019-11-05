import DrawUtil from "../draw-util";
import {Point} from "../../model/point";
import {Vector} from "./model/vector";
import {ComplexLine} from "./model/complex-line";
import CImageUtil from "../cimage-util";

export class HostParabola {

  public static drawParabola(canvas, referencePoint: Vector, from: number = 0, to: number = 1350) {
    for (let x = 0; x < 1351; x++) {
      let y = 0.001 * Math.pow(x - referencePoint.x, 2) + referencePoint.y;
      DrawUtil.drawPoint(canvas, new Point(x, y))
    }
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

      if(lastPoint != null){
        DrawUtil.drawPointLineOnCanvas(canvas,lastPoint,l.getFirstPoint(), "blue", 3, false)
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
