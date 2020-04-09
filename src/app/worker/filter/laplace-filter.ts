import {SImage} from "../../model/SImage";
import {FilterHelper} from "./filter-helper";
import {WindowingFilter} from "./windowing-filter";

export class LaplaceFilter {


  public static scanHost(image: SImage, target: SImage): Array<Array<number>> {

    const sourceImg = FilterHelper.imageToPNG(image);
    const targetIMG = FilterHelper.createPNG(sourceImg.width, sourceImg.height);

    let kernel = [
      [0, 0, -1, 0, 0],
      [0, -1, -2, -1, 0],
      [-1, -2, 16, -2, -1],
      [0, -1, -2, -1, 0],
      [0, 0, -1, 0, 0]
    ];

    const result = new Array<Array<number>>(sourceImg.width);
    for (let i = 0; i < result.length; i++) {
      const line = new Array<number>(sourceImg.height);
      line.fill(0);
      result[i] = line
    }

    let i = 1;
    const imageWidth = sourceImg.width;
    let cScanStartWidth = 0;
    let cScanEndWidth = sourceImg.width;
    let cScanStartHeight = 0;
    let cScanEndHeight = sourceImg.height;

    let min = 0;
    let max = Number.MIN_SAFE_INTEGER;

    const kernelIterSize = Math.floor(kernel.length / 2);

    for (let x = cScanStartWidth + kernelIterSize; x < cScanEndWidth - kernelIterSize; x++) {
      for (let y = cScanStartHeight + kernelIterSize; y < cScanEndHeight - kernelIterSize; y++) {
        let res: number = 0;
        for (let fx = -kernelIterSize; fx < kernelIterSize + 1; fx++) {
          for (let fy = -kernelIterSize; fy < kernelIterSize + 1; fy++) {
            const filterIndex = ((((x + fx)) + (y + fy) * imageWidth) * 4);
            if (sourceImg.data[filterIndex] == null) {
              console.log("wuuuu");
            }
            res += kernel[kernelIterSize + fx][kernelIterSize + fy] * sourceImg.data[filterIndex];
          }
        }

        const r = res < 0 ? 0 : res;
        result[x][y] = r;

        // if (min > r)
        //   min = r;

        if (max < r)
          max = r
      }
    }

    for (let x = cScanStartWidth; x < cScanEndWidth; x++) {
      for (let y = cScanStartHeight; y < cScanEndHeight; y++) {
        const index = (x + y * imageWidth) * 4;
        const scaled = WindowingFilter.calcValue(result[x][y], 0, 255, min, max);
        targetIMG.data[index] = scaled;
        targetIMG.data[index + 1] = scaled;
        targetIMG.data[index + 2] = scaled;
        targetIMG.data[index + 3] = 255;
        result[x][y] = scaled;
      }
    }

    FilterHelper.pngToImage(targetIMG, target);
    return result;
  }
}
