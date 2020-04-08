import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";
import DrawUtil from "../../utils/draw-util";
import {Point} from "../../model/point";

export class BinarizeColorThreshold extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, startEndColor: { r: number, g: number, b: number, a: number },  targetPos: number = sourcePos) {
    return map((data: FilterData) => {

      const [source, target] = this.getSourceAndTarget(data, sourcePos, targetPos);

      const sourceImage = FilterHelper.imageToPNG(source);
      const targetCanvas = FilterHelper.createCanvas(sourceImage.width, sourceImage.height);
      const targetCX = FilterHelper.get2DContext(targetCanvas);

      const result: ColumnData[] = [];

      for (let x = 0; x < sourceImage.width; x++) {

        let start = false;
        let lastWithe = 0;

        for (let y = 0; y < sourceImage.height; y++) {
          const idx = (sourceImage.width * y + x) << 2;

          if (sourceImage.data[idx] == startEndColor.r && sourceImage.data[idx + 1] == startEndColor.g && sourceImage.data[idx + 2] == startEndColor.b && sourceImage.data[idx + 3] == startEndColor.a) {
            if (!start) {
              start = true;
              lastWithe = y;
              DrawUtil.drawPointOnCanvas(targetCX, new Point(x, y), "green");
              const newLine = new ColumnData();
              newLine.x = x;
              newLine.startY = y;
              result.push(newLine);
              continue;
            } else {
              if (y - lastWithe == 1) {
                lastWithe = y;
                result[result.length - 1].startY = y + 1;
                continue;
              } else {
                DrawUtil.drawPointOnCanvas(targetCX, new Point(x, y), "blue");
                result[result.length - 1].endY = y + 1;
                break;
              }
            }
          }
          if (start) {
            if (Math.max(sourceImage.data[idx], sourceImage.data[idx + 1], sourceImage.data[idx + 2]) > 0) {
              DrawUtil.drawPointOnCanvas(targetCX, new Point(x, y), "red");
              result[result.length - 1].binarizedInfos.push(true)
            } else {
              result[result.length - 1].binarizedInfos.push(false)
            }
          }

        }

        if (start) {
          result[result.length - 1].calculatePercentInfos();
        }
      }

      const rowData = new RowData();
      rowData.calculateRowData(result);

      if (target) {
        FilterHelper.canvasToImage(targetCanvas, target)
      }

      let resultStr = "Copy to excel: <br>";
      for(let str of rowData.rowPercent){
        resultStr += `${str} `;
      }

      data.output += resultStr;

      return data;
    });
  }
}

export interface ProcessCountedPixelsOptions {
  sourceData?: string
  pixelInMM?: number
}


class ColumnData {
  x: number = 0;
  startY: number = 0;
  endY: number = 0;
  binarizedInfos: boolean[] = [];
  percentInfos: number[] = new Array(100).fill(0);

  isValid(): boolean {
    return this.endY != 0;
  }

  calculatePercentInfos(): boolean {

    if (!this.isValid()) {
      return false;
    }

    const pixelPerPercent = this.binarizedInfos.length / 100;
    let pixelPercentCounter = pixelPerPercent;
    let percentInfoCounter = 0;
    let pix = 0;

    for (let i = 0; i < this.binarizedInfos.length; i++) {
      if (pixelPercentCounter - 1 < 0) {
        this.percentInfos[percentInfoCounter] += (this.binarizedInfos[i] ? 1 : 0) * pixelPercentCounter;
        this.percentInfos[percentInfoCounter] /= pixelPerPercent;
        percentInfoCounter++;

        pix = Math.round(((1 - pixelPercentCounter)) * 100) / 100;

        while (pix > pixelPerPercent) {
          this.percentInfos[percentInfoCounter] += (this.binarizedInfos[i] ? 1 : 0) * pixelPerPercent;
          this.percentInfos[percentInfoCounter] /= pixelPerPercent;
          pix = pix - pixelPerPercent;
          percentInfoCounter++;
        }

        this.percentInfos[percentInfoCounter] += (this.binarizedInfos[i] ? 1 : 0) * pix;
        pixelPercentCounter = pixelPerPercent - pix;

      } else {
        this.percentInfos[percentInfoCounter] += this.binarizedInfos[i] ? 1 : 0;
        pixelPercentCounter--;
      }
    }

    console.log(percentInfoCounter)

    return true;
  }
}

class RowData {
  rowPercent: number[] = new Array(100).fill(0);

  calculateRowData(columnData: ColumnData[]) {
    for (let i = 0; i < this.rowPercent.length; i++) {
      let valid = 0;
      for (let y = 0; y < columnData.length; y++) {
        if (columnData[y].isValid()) {
          valid++;
          this.rowPercent[i] += columnData[y].percentInfos[i]
        }
      }

      this.rowPercent[i] /= valid
    }
  }
}
