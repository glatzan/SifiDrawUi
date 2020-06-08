import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";
import DrawUtil from "../../utils/draw-util";
import {Point} from "../../model/point";

export class AddColorValuesFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, startEndColor: { r: number, g: number, b: number, a: number }, binSize = 10, addChannel: number = 0) {
    return map((data: FilterData) => {

      const [source, target] = this.getSourceAndTarget(data, sourcePos,null);

      const sourceImage = FilterHelper.imageToPNG(source);

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
              const newLine = new ColumnData(binSize);
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
                result[result.length - 1].endY = y + 1;
                break;
              }
            }
          }
          if (start) {
            result[result.length - 1].colorValue.push(sourceImage.data[idx + addChannel])
          }

        }

        if (start) {
          result[result.length - 1].calculateBins();
        }
      }

      const rowData = new RowData(binSize);
      rowData.calculateRowData(result);

      let resultStr = "Copy to excel: <br>";
      for (let str of rowData.rowValues) {
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
  colorValue: number[] = [];
  binSize: number = 100;
  binValues: number[];

  constructor(binSize: number) {
    this.binSize = binSize;
    this.binValues = new Array(this.binSize).fill(0);
  }

  isValid(): boolean {
    return this.endY != 0;
  }

  calculateBins(): boolean {

    if (!this.isValid()) {
      return false;
    }

    const pixelPerBin = this.colorValue.length / this.binSize;
    let percentInfoCounter = 0;
    let pix = 0;

    for (let i = 0; i < this.binSize; i++) {
      let start = i * pixelPerBin;
      let index = Math.floor(start);
      let tmpCounter = pixelPerBin; //- (1 - (start - index));
      let result = 0;

      while (tmpCounter > 0) {
        if (start % 1 === 0) {
          if (tmpCounter - 1 >= 1) {
            result += this.colorValue[index];
            tmpCounter--;
          } else {
            result += this.colorValue[index] * tmpCounter;
            tmpCounter = 0;
          }
        } else {
          let tmp = (1 - (start - index) > pixelPerBin) ? pixelPerBin : 1 - (start - index);
          result += this.colorValue[index] * tmp;
          tmpCounter -= tmp;
          start += tmp;
        }
        index++;
      }
      this.binValues[i] = result
    }
    return true;
  }
}

class RowData {
  binSize: number = 100;
  rowValues: number[];

  constructor(binSize: number) {
    this.binSize = binSize;
    this.rowValues = new Array(binSize).fill(0);
  }

  calculateRowData(columnData: ColumnData[]) {
    for (let i = 0; i < this.rowValues.length; i++) {
      for (let y = 0; y < columnData.length; y++) {
        if (columnData[y].isValid()) {
          this.rowValues[i] += columnData[y].binValues[i]
        }
      }
    }
  }
}
