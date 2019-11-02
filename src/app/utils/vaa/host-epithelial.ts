import {FilterData} from "../../worker/filter-data";
import {PNG} from "pngjs";
import DrawUtil from "../draw-util";
import {Point} from "../../model/point";
import {Vector} from "./model/vector";

export class HostEpithelial {

  public static scanHost(data: FilterData, canvas, scanAtX: number = 400, scanWidth: number = 550, scanAtY: number = 6, scanHeight: number = 400, filterSize: number = 5): Array<number> {

    const buff = new Buffer(data.img.data, 'base64');
    const png = PNG.sync.read(buff);
    const resultArr: number[] = [];
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
            if ((average / averageCount) * 2 < (meanValue / filterVolume)) {
              resultArr.push(y);
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

      const lastY = resultArr[resultArr.length - 1];

      DrawUtil.drawPointLineOnCanvas(canvas, new Point(scanAtX + z, lastY), new Point(scanAtX + filterSize + z, lastY), "Blue", 1, false)
      resultArr.push(lastY);
    }

    return resultArr;
  }

  public static reduceMeanValues(hostArray: Array<number>): Array<number> {
    const resultArr: number[] = [];

    let mean = 0;

    for (let i = 0; i < hostArray.length; i++) {
      if (i > 0 && i % 10 === 0) {
        resultArr.push(mean / 10);
        mean = 0;
      }
      mean += hostArray[i];
    }

    if (resultArr.length % 10 !== 0) {
      resultArr.push(mean / resultArr.length % 10);
    }else{
      resultArr.push(mean / 10);
    }

    return resultArr;
  }

  public static findTopPoint(scanValues: Array<number>, canvas, scanAtX: number = 400, scanWidth: number = 50): Vector {
    let minY = Number.MAX_VALUE;
    let xValue = 0;
    let sameCount = 1;

    for (let i = 0; i < scanValues.length; i++) {
      if (minY >= scanValues[i]) {
        if (minY == scanValues[i]) {
          sameCount++;
        } else {
          xValue = scanAtX + i * scanWidth;
          sameCount = 1;
        }
        minY = scanValues[i];
      }

      DrawUtil.drawPointLineOnCanvas(canvas, new Point(scanAtX + i * scanWidth, scanValues[i] - 10), new Point(scanAtX + i * scanWidth, scanValues[i] + 10), "yellow", 1, false);
      DrawUtil.drawPointLineOnCanvas(canvas, new Point(scanAtX + i * scanWidth, scanValues[i]), new Point(scanAtX + scanWidth + i * scanWidth, scanValues[i]), "Chartreuse", 1, false);

      DrawUtil.text(canvas, String(scanValues[i]), new Point(scanAtX + scanWidth / 2 + i * scanWidth, scanValues[i] + 5), "16px Arial", "DarkOrange")
    }

    if (sameCount > 0) {
      xValue += sameCount * scanWidth / 2;
    }

    DrawUtil.drawPoint(canvas, new Point(xValue, minY),"Aqua", 4);

    return new Vector(xValue, minY);
  }
}
