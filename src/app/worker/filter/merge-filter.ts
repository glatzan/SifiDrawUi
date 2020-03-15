import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";

export class MergeFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, sourcePos2: number, targetPos: number = sourcePos) {
    return map((data: FilterData) => {

      const source1 = this.getImage(sourcePos, data);
      const source2 = this.getImage(sourcePos2, data);
      const target = this.getImage(targetPos, data);

      if (source1 === null || source2 === null || target === null) {
        throw new Error(`Image not found index img 1 ${sourcePos} or img 2 ${sourcePos2} or target ${targetPos}!`);
      }

      const image1 = FilterHelper.imageToPNG(source1);
      const image2 = FilterHelper.imageToPNG(source2);

      const targetImage = FilterHelper.createPNG(image1.width, image1.height, 2);

      if (image1.width > image2.width || image1.height > image2.height) {
        throw new Error(`Image two must be equal or bigger in size ${image1.width} - ${image2.width} / ${image1.height} - ${image2.height}`);
      }

      for (let y = 0; y < image1.height; y++) {
        for (let x = 0; x < image1.width; x++) {
          const idx = (image1.width * y + x) << 2;
          targetImage.data[idx] = image1.data[idx] | image2.data[idx];
          targetImage.data[idx + 1] = image1.data[idx + 1] | image2.data[idx + 1];
          targetImage.data[idx + 2] = image1.data[idx + 2] | image2.data[idx + 2];
          targetImage.data[idx + 3] = 255
        }
      }

      FilterHelper.pngToImage(targetImage, target);
      return data;
    });
  }
}
