import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";
import {ColorType} from "pngjs";

export class ColorThresholdFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, colorThresholdOptions?: ColorThresholdOptions) {
    return map((data: FilterData) => {
      if (colorThresholdOptions === undefined)
        colorThresholdOptions = {};

      if (!colorThresholdOptions.targetData)
        colorThresholdOptions.targetData = "countData";

      if (!colorThresholdOptions.channel)
        colorThresholdOptions.channel = 0;

      if (!colorThresholdOptions.channelThreshold)
        colorThresholdOptions.channelThreshold = 2;

      if (!colorThresholdOptions.otherChannelsDiffThreshold)
        colorThresholdOptions.otherChannelsDiffThreshold = 15;

      if(!colorThresholdOptions.colorType)
        colorThresholdOptions.colorType = 6

      var [channel, channel1, channel2] = [0, 1, 2];

      if (colorThresholdOptions.channel == 1) {
        channel = 1;
        channel1 = 0;
        channel2 = 2;
      } else if (colorThresholdOptions.channel == 2) {
        channel = 2;
        channel1 = 0;
        channel2 = 1;
      }

      const [source, target] = this.getSourceAndTarget(data, sourcePos, colorThresholdOptions.targetImagePos);

      const sourceImage = FilterHelper.imageToPNG(source);
      const targetImage = FilterHelper.createPNG(sourceImage.width, sourceImage.height,colorThresholdOptions.colorType);

      let counter = 0;

      for (let x = 0; x < sourceImage.width; x++) {
        for (let y = 0; y < sourceImage.height; y++) {
          const idx = (sourceImage.width * y + x) << 2;

          if ((sourceImage.data[idx+ channel] > (Math.max(sourceImage.data[idx+channel1], sourceImage.data[idx+channel2]) * colorThresholdOptions.channelThreshold))
            && (Math.abs(sourceImage.data[idx+channel1] - sourceImage.data[idx+channel2]) < colorThresholdOptions.otherChannelsDiffThreshold)) {
            counter++;
            if (target) {
              targetImage.data[idx] = sourceImage.data[idx];
              targetImage.data[idx + 1] = sourceImage.data[idx + 1];
              targetImage.data[idx + 2] = sourceImage.data[idx + 2];
              targetImage.data[idx + 3] = sourceImage.data[idx + 3];
            }
          } else {
            if (target) {
              targetImage.data[idx] = 0;
              targetImage.data[idx + 1] = 0;
              targetImage.data[idx + 2] = 0;
              targetImage.data[idx + 3] = 0;
            }
          }

        }
      }

      if (target) {
        FilterHelper.pngToImage(targetImage, target,colorThresholdOptions.colorType)
      }

      const entry = {tag: sourcePos.toString(), name: source.name, value: counter};
      data.pushData(colorThresholdOptions.targetData, entry);

      return data;
    });
  }

}

export interface ColorThresholdOptions {
  targetData?: string
  targetImagePos?: number
  channel?: number
  channelThreshold?: number
  otherChannelsDiffThreshold?: number
  colorType?: ColorType
}
