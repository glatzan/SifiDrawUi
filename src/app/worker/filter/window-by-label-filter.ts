import {AbstractFilter, Services} from "./abstract-filter";
import {flatMap} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";
import {Point} from "../../model/point";
import {PNG} from "pngjs";
import {WindowingFilter} from "./windowing-filter";

export class WindowByLabelFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, targetPos: number, windowByLabelOptions: WindowByLabel) {
    return flatMap((data: FilterData) => {

      if (!windowByLabelOptions)
        windowByLabelOptions = {};

      const source = this.getImage(sourcePos, data);

      if (!source) {
        throw new Error("Source or target not found!")
      }

      let thresholdChanel = 0;

      if (!windowByLabelOptions.thresholdChannel || windowByLabelOptions.thresholdChannel < 0 || windowByLabelOptions.thresholdChannel > 3)
        thresholdChanel = 0;
      else
        thresholdChanel = windowByLabelOptions.thresholdChannel;

      let [minLayer, maxLayer] = [null, null];

      if (windowByLabelOptions.minLabel)
        minLayer = FilterHelper.findLayer(source.layers, windowByLabelOptions.minLabel);

      if (windowByLabelOptions.maxLabel)
        maxLayer = FilterHelper.findLayer(source.layers, windowByLabelOptions.maxLabel);

      if ((!minLayer || !maxLayer) || (minLayer && minLayer.lines.length === 0) || (maxLayer && maxLayer.lines.length === 0))
        throw new Error("Min and max Layer are empty or not set!");

      const sourceImage = FilterHelper.imageToPNG(source);

      let [minLayerThreshold, maxLayerThreshold] = [0, 255];

      if (minLayer)
        minLayerThreshold = WindowByLabelFilter.getValue(minLayer.lines[0], sourceImage, thresholdChanel);

      if (maxLayer)
        maxLayerThreshold = WindowByLabelFilter.getValue(maxLayer.lines[0], sourceImage, thresholdChanel);

      return new WindowingFilter(this.services).doFilter(sourcePos, targetPos, {
        aMin: minLayerThreshold,
        aMax: maxLayerThreshold,
        maxValue: windowByLabelOptions.maxValue,
        minValue: windowByLabelOptions.minValue
      });
    });
  }

  private static getValue(points: Point[], image: PNG, channel: number): number {
    let layerThreshold = 0;
    for (let point of points) {
      const arrayPost = point.y * image.width * 4 + point.x * 4 + channel;
      const threshold = image.data[arrayPost];
      console.log(`${point.x} ${point.y} => ${threshold}`);
      layerThreshold += threshold;
    }
    return layerThreshold / points.length;
  }
}

export interface WindowByLabel {
  minLabel?: string
  maxLabel?: string
  minValue?: number
  maxValue?: number
  thresholdChannel?: number
}
