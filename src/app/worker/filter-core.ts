import {CImage} from "../model/CImage";
import {flatMap} from "rxjs/operators";
import {FilterData} from "./filter-data";
import {Observable} from "rxjs";
import {ColorType, PNG} from "pngjs";
import {ContrastFilter, ContrastOptions} from "./filter/contrast-filter";
import {Services} from "./filter/abstract-filter";
import {FilterHelper} from "./filter/filter-helper";
import {AffineTransformationMatrixFilter} from "./filter/affine-transformation-matrix-filter";
import {CreateImageFilter, CreateImageOptions} from "./filter/create-image-filter";
import {HistogramFilter, HistogramOptions} from "./filter/histogram-filter";
import {MergeFilter} from "./filter/merge-filter";
import {ApplyTransformationFilter} from "./filter/apply-transformation-filter";
import {LoadFilter} from "./filter/load-filter";
import {SaveFilter, SaveOptions} from "./filter/save-filter";
import {ThresholdFilter, ThresholdOptions} from "./filter/threshold-filter";
import {WindowByLabel, WindowByLabelFilter} from "./filter/window-by-label-filter";
import {MaxifyColorChannelFilter, MaxifyOptions} from "./filter/maxify-color-channel-filter";
import {ThresholdByPercentile, ThresholdPercentileOptions} from "./filter/threshold-by-percentile";
import {DisplayFilter} from "./filter/display-filter";
import {ExtractSubImageFilter} from "./filter/extract-sub-image-filter";
import {ProcessCountedPixelsFilter, ProcessCountedPixelsOptions} from "./filter/process-counted-pixels-filter";
import {OutputFilter} from "./filter/output-filter";
import {InverseFilter, InverseFilterOptions} from "./filter/inverse-filter";
import {CopyLayerData, CopyLayerToImageFilter, CopyLayerToImageOptions} from "./filter/copy-layer-to-image-filter";
import {DrawLayerFilter, DrawLayerOptions} from "./filter/draw-layer-filter";
import {ProcessThresholdSurfaces} from "./filter/process-threshold-surfaces";
import {CloneImageFilter} from "./filter/clone-image-filter";
import {HostParabolaFilter} from "./filter/vaa/host-parabola-filter";
import {FlaskFilter} from "./filter/flask-filter";
import {FindCenterLineFilter} from "./filter/vaa/find-center-line-filter";
import {ReducePointsFilter} from "./filter/vaa/reduce-points-filter";
import {DetectHostLineFilter} from "./filter/vaa/detect-host-line-filter";
import {ReducePointsByDistanceFilter} from "./filter/vaa/reduce-points-by-distance-filter";
import {DetectGraftLineFilter} from "./filter/vaa/detect-graft-line-filter";
import {DrawHostAndGraftLineFilter, DrawHostAndGraftLineOptions} from "./filter/vaa/draw-host-and-graft-line-filter";
import {FindGraftGapFilter, FindGraftGapOptions} from "./filter/vaa/find-graft-gap-filter";
import {ProcessColorThreshold} from "./filter/process-color-threshold";
import {ColorThresholdFilter, ColorThresholdOptions} from "./filter/color-threshold-filter";
import {ManualAffineTransformationMatrixFilter} from "./filter/manual-affine-transformation-matrix-filter";
import {Point} from "../model/point";
import {
  ApplyTransformationOnLayerFilter,
  ApplyTransformationOnLayerOptions
} from "./filter/apply-transformation-on-layer-filter";
import {BinarizeColorThreshold} from "./filter/binarize-color-threshold";
import {DrawBinaryLineFilter} from "./filter/draw-binary-line-filter";
import {MeanFilter} from "./filter/mean-filter";
import {ProcessMeanFilter} from "./filter/process-mean-filter";

export class FilterCore {

  services: Services;

  constructor(services: Services) {
    this.services = services;
  }

  load() {
    return new LoadFilter(this.services).doFilter()
  }

  createAffineTransformationMatrix(sourcePos: number, targetPos: number, sourceLayerID: string, targetLayerID: string = sourceLayerID, targetDataName = 'affineMatrix') {
    return new AffineTransformationMatrixFilter(this.services).doFilter(sourcePos, sourceLayerID, targetPos, targetLayerID, targetDataName);
  }

  applyTransformation(sourcePos: number, targetPos: number = sourcePos, sourceData: string = "affineMatrix") {
    return new ApplyTransformationFilter(this.services).doFilter(sourcePos, targetPos, sourceData);
  }

  copyLayerToImage(sourcePos: number, layers: [CopyLayerData], copyLayerToImageOptions?: CopyLayerToImageOptions) {
    return new CopyLayerToImageFilter(this.services).doFilter(sourcePos, layers, copyLayerToImageOptions);
  }

  toBinary(sourcePos: number, binaryOptions?: BinaryOptions) {
    if (binaryOptions) {
      const maxifyOptions = {
        targetImagePos: binaryOptions.targetPos,
        threshold_r: binaryOptions.threshold,
        threshold_g: binaryOptions.threshold,
        threshold_b: binaryOptions.threshold
      };
      return this.maxifyColorChannel(sourcePos, maxifyOptions)
    } else {
      return this.maxifyColorChannel(sourcePos)
    }
  }

  thresholdByPercentile(sourcePos: number, targetImagePos: number, thresholdPercentileOptions?: ThresholdPercentileOptions) {
    return new ThresholdByPercentile(this.services).doFilter(sourcePos, targetImagePos, thresholdPercentileOptions);
  }

  mean(sourcePos: number, targetData?: string) {
    return new MeanFilter(this.services).doFilter(sourcePos, targetData);
  }

  processMean(sourceData = "mean_data") {
    return new ProcessMeanFilter(this.services).doFilter(sourceData);
  }

  maxifyColorChannel(sourcePos: number, maxifyOptions?: MaxifyOptions) {
    return new MaxifyColorChannelFilter(this.services).doFilter(sourcePos, maxifyOptions);
  }

  threshold(sourcePos: number, thresholdOptions?: ThresholdOptions) {
    return new ThresholdFilter(this.services).doFilter(sourcePos, thresholdOptions);
  }

  merge(sourcePos: number, sourcePos2: number, targetPos: number = sourcePos) {
    return new MergeFilter(this.services).doFilter(sourcePos, sourcePos2, targetPos)
  }

  contrast(sourcePos: number, contrastOptions?: ContrastOptions) {
    return new ContrastFilter(this.services).doFilter(sourcePos, contrastOptions)
  }

  windowByLabel(sourcePos: number, targetPos: number, windowByLabelOptions: WindowByLabel) {
    return new WindowByLabelFilter(this.services).doFilter(sourcePos, targetPos, windowByLabelOptions);
  }

  histogram(imageOnePos: number, channel: number, histogramOptions?: HistogramOptions) {
    return new HistogramFilter(this.services).doFilter(imageOnePos, channel, histogramOptions)
  }

  createImage(createImageOptions?: CreateImageOptions) {
    return new CreateImageFilter(this.services).doFilter(createImageOptions);
  }

  drawLayer(sourcePos: number, layerIDs: [string], targetPos: number = sourcePos, drawLayerOptions?: DrawLayerOptions) {
    return new DrawLayerFilter(this.services).doFilter(sourcePos, layerIDs, targetPos, drawLayerOptions);
  }

  extractSubImage(sourcePos: number, extractionLayerID: string, targetPos: number) {
    return new ExtractSubImageFilter(this.services).doFilter(sourcePos, extractionLayerID, targetPos);
  }

  cloneImage(sourcePos: number) {
    return new CloneImageFilter(this.services).doFilter(sourcePos);
  }

  hostParabola(sourcePos: number, target: number = null) {
    return new HostParabolaFilter(this.services).doFilter(sourcePos, target);
  }

  processColorThreshold(sourceData = "countData") {
    return new ProcessColorThreshold(this.services).doFilter(sourceData);
  }

  colorThresholdFilter(sourcePos: number, colorThresholdOptions?: ColorThresholdOptions) {
    return new ColorThresholdFilter(this.services).doFilter(sourcePos, colorThresholdOptions);
  }

  public toColorType(sourceImgPos: number, colorType: string, colorTypeOptions?: ColorTypeOptions) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {

        const source = this.getImage(sourceImgPos, data);
        const target = (colorTypeOptions && colorTypeOptions.targetImagePos) ? this.getImage(colorTypeOptions.targetImagePos, data) : source;

        if (source == null || target == null) {
          observer.error(`Image not found index source ${source} or target ${target}!`);
        }

        const buff = new Buffer(data.img.data, 'base64');
        const png = PNG.sync.read(buff);
        const buffer = PNG.sync.write(png, {colorType: FilterCore.getColorType(colorType)});
        target.data = buffer.toString('base64');

        observer.next(data);
        observer.complete();
      }
    ));
  }

  flask(sourcePos: number, endpoint: string, targetPos = sourcePos) {
    return new FlaskFilter(this.services).doFilter(sourcePos, endpoint, targetPos);
  }

  display(sourcePos: number = -1) {
    return new DisplayFilter(this.services).doFilter(sourcePos);
  }

  processCountedPixels(processCountedPixelsOptions?: ProcessCountedPixelsOptions) {
    return new ProcessCountedPixelsFilter(this.services).doFilter(processCountedPixelsOptions);
  }

  manualAffineTransformationMatrix(t1: Point[], t2: Point[], targetDataName = 'manualAffineMatrix') {
    return new ManualAffineTransformationMatrixFilter(this.services).doFilter(t1, t2, targetDataName)
  }

  applyTransformationOnLayerFilter(sourcePos: number, layers: [string], applyTransformationOnLayerOptions?: ApplyTransformationOnLayerOptions) {
    return new ApplyTransformationOnLayerFilter(this.services).doFilter(sourcePos, layers, applyTransformationOnLayerOptions)
  }

  processThresholdSurfaces(sourceData = "countData") {
    return new ProcessThresholdSurfaces(this.services).doFilter(sourceData);
  }

  save(targetProject: string, saveOptions?: SaveOptions) {
    return new SaveFilter(this.services).doFilter(targetProject, saveOptions);
  }

  invertColors(sourcePos: number, targetPos: number = sourcePos, inverseFilterOptions?: InverseFilterOptions) {
    return new InverseFilter(this.services).doFilter(sourcePos, targetPos, inverseFilterOptions);
  }

  findCenterLine(sourcePos: number, centerLineData: string = "lines") {
    return new FindCenterLineFilter(this.services).doFilter(sourcePos, centerLineData);
  }

  reducePoints(modulo: number, lineData: string = "lines") {
    return new ReducePointsFilter(this.services).doFilter(modulo, lineData);
  }

  detectHostLine(targetPos: number = -1, lineSource = "lines", hostParabola = "hostParabola") {
    return new DetectHostLineFilter(this.services).doFilter(targetPos, lineSource, hostParabola);
  }

  detectGraftLine(targetPos = -1, lineSource = "graftLines", hostParabola = "hostParabola") {
    return new DetectGraftLineFilter(this.services).doFilter(targetPos, lineSource, hostParabola);
  }

  reducePointsByDistance(distance: number = 10, lineData: string = "lines") {
    return new ReducePointsByDistanceFilter(this.services).doFilter(distance, lineData)
  }

  outputData() {
    return new OutputFilter(this.services).doFilter();
  }

  drawBinaryLine(sourcePos: number, layerIDs: [string], rgba: { r: number, g: number, b: number, a: number }, targetPos: number = sourcePos) {
    return new DrawBinaryLineFilter(this.services).doFilter(sourcePos, layerIDs, rgba, targetPos)
  }

  drawHostAndGraftLine(sourceName: string, drawHostAndGraftLineOptions?: DrawHostAndGraftLineOptions) {
    return new DrawHostAndGraftLineFilter(this.services).doFilter(sourceName, drawHostAndGraftLineOptions)
  }

  findGraftGap(sourcePos: number, findGraftGapOption?: FindGraftGapOptions) {
    return new FindGraftGapFilter(this.services).doFilter(sourcePos, findGraftGapOption);
  }

  binarizeColorThreshold(sourcePos: number, startEndColor: { r: number, g: number, b: number, a: number }, targetPos: number = sourcePos) {
    return new BinarizeColorThreshold(this.services).doFilter(sourcePos, startEndColor, targetPos)
  }

  private pushAndAddImageToStack(img: CImage, data: FilterData) {
    data.pushIMG(img);
    this.services.displayCallback.addImage(img);
  }

  private getImage(index: number, data: FilterData): CImage {
    if (index < -1 || index >= data.imgStack.length) {
      return null;
    }

    if (index === -1) {
      const img = FilterHelper.createNewImage(1, 1);
      this.pushAndAddImageToStack(img, data);
      return img;
    }

    return data.imgStack[index];
  }


  private static getColorType(type: string): ColorType {
    switch (type) {
      case "rgb":
        return 0;
      case "greya":
        return 4;
      case "rgba":
        return 6;
      case "grey":
      default:
        return 0;
    }
  }


}

export interface BinaryOptions {
  targetPos?: number
  threshold?: number
}


export interface ColorTypeOptions {
  targetImagePos?: number
}
