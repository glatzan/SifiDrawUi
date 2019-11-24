import {FilterData} from "../../worker/filter-data";
import {PNG} from "pngjs";
import DrawUtil from "../draw-util";
import {Point} from "../../model/point";
import {Vector} from "./model/vector";

export class HostEpithelial {

  public static scanHost(data: FilterData, canvas, scanAtX: number = 375, scanWidth: number = 600, scanAtY: number = 6, scanHeight: number = 400, filterSize: number = 3): Array<Vector> {

    const buff = new Buffer(data.img.data, 'base64');
    const png = PNG.sync.read(buff);
    const resultArr: Vector[] = [];
    const filterVolume = filterSize * filterSize;

    // outer scan loop
    scanLoop : for (let z = 0; z < scanWidth; z += filterSize) {

      let average = 0;
      let averageCount = 0;
      let maxY = 600;
      let meanValue = 0;
      let count = 1;

      for (let y = scanAtY; y < scanHeight; y++) {
        for (let x = scanAtX + z; x < scanAtX + filterSize + z; x++) {
          let idx = (png.width * y + x) << 2;

          meanValue += (png.data[idx] + png.data[idx + 1] + png.data[idx + 2]) / 3;

          if (count % filterVolume == 0) {

            average += meanValue / filterVolume;
            averageCount++;

            // filter trigger value
            if ((average / averageCount) * 2.5 < (meanValue / filterVolume)) {
              resultArr.push(new Vector(scanAtX + z, y));
              DrawUtil.drawPointLineOnCanvas(canvas, new Point(scanAtX + z, y), new Point(scanAtX + filterSize + z, y), "red", 1, false)
              continue scanLoop;
            } else {
              DrawUtil.drawPointLineOnCanvas(canvas, new Point(scanAtX + z, y), new Point(scanAtX + filterSize + z, y), "green", 1, false)
              meanValue = 0;
              count = 1;
            }
          } else {
            count++;
          }
        }
      }

      // correction for not detected values
      const lastY = resultArr[resultArr.length - 1];
      DrawUtil.drawPointLineOnCanvas(canvas, new Point(scanAtX + z, lastY.y), new Point(scanAtX + filterSize + z, lastY.y), "Blue", 1, false)
      resultArr.push(new Vector(lastY.x + filterSize,lastY.y));
    }

    return resultArr;
  }

  public static reduceMeanValues(hostArray: Array<Vector>, {xWidth = 3}: { xWidth?: number } = {}): Array<Vector> {
    const resultArr: Vector[] = [];

    let mean = new Vector(0, 0);

    for (let i = 0; i <= hostArray.length; i++) {
      if (i > 0 && i % 10 === 0) {
        resultArr.push(new Vector((mean.x + xWidth / 2) / 10, mean.y / 10));
        mean.x = 0;
        mean.y = 0;
      }

      if (i === hostArray.length) {
        if (i % 10 !== 0)
          resultArr.push(new Vector((mean.x + xWidth / 2) / (resultArr.length % 10), mean.y / 10));
        break;
      }
      mean.x += hostArray[i].x;
      mean.y += hostArray[i].y;
    }

    return resultArr;
  }

  public static findTopPoint(scanValues: Array<Vector>, canvas, {scanWidth = 30}: { scanWidth?: number } = {}): Vector {
    let minY = Number.MAX_VALUE;
    let points = new Vector(0, 0);
    let sameCount = 1;

    for (let i = 0; i < scanValues.length; i++) {
      if (minY + 1 >= scanValues[i].y) {
        if (minY + 1 >= scanValues[i].y && minY - 1 <= scanValues[i].y) {
          sameCount++;
          points.x += scanValues[i].x;
          points.y += scanValues[i].y;
        } else {
          minY = scanValues[i].y;
          points.x = scanValues[i].x;
          points.y = scanValues[i].y;
          sameCount = 1;
        }
      }

      DrawUtil.drawPointLineOnCanvas(canvas, new Point(scanValues[i].x - scanWidth / 2, scanValues[i].y - 5), new Point(scanValues[i].x- scanWidth / 2, scanValues[i].y + 5), "yellow", 1, false);
      DrawUtil.drawPointLineOnCanvas(canvas, new Point(scanValues[i].x - scanWidth / 2, scanValues[i].y), new Point(scanValues[i].x + scanWidth / 2, scanValues[i].y), "Chartreuse", 1, false);

      DrawUtil.text(canvas, String(scanValues[i].y), new Point(scanValues[i].x, scanValues[i].y + 5), "12px Arial", "DarkOrange")
    }

    if (sameCount > 1) {
      points.x = points.x / sameCount;
      points.y = points.y / sameCount;
    }

    console.log("---------");
    console.log(sameCount);
    console.log(points)

    DrawUtil.drawPoint(canvas, new Point(points.x, points.y), "Aqua", 5);

    return points;
  }

  public static adjustParabola(scanValues: Array<number>, topPoint: Vector, canvas) {

  }
}
