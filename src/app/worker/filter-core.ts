import {CImage} from "../model/CImage";
import {flatMap, map} from "rxjs/operators";
import {FilterData} from "./filter-data";
import {Observable} from "rxjs";
import {Layer} from "../model/layer";
import {applyToPoints} from "transformation-matrix";
import {Point} from "../model/point";
import {LayerType} from "../model/layer-type.enum";
import {ColorType, PNG} from "pngjs";
import DrawUtil from "../utils/draw-util";
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

  copyLayerToImage({sourceImgPos = null, targetImgPos = null, layerIDs = null, affineTransformation = false, affineMatrixSource = "affineMatrix"}: { sourceImgPos: number, targetImgPos: number, layerIDs: [{ oldID: string, newID: string, name: string, type?: string, color?: string }], affineTransformation?: boolean, affineMatrixSource?: string }) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
      if (sourceImgPos < 0 || sourceImgPos >= data.imgStack.length || targetImgPos < 0 || targetImgPos >= data.imgStack.length) {
        observer.error(`Clone Image out of bounds source IMG ${sourceImgPos} or target img ${targetImgPos}`);
      }

      if (affineTransformation && data.getData(affineMatrixSource) === undefined) {
        observer.error(`No affine matrix at position ${affineMatrixSource}`);
      }

      if (layerIDs === null) {
        observer.error(`Layer ids to convert hav to be provided!`);
      }

      const getLayerType = function (type: string): LayerType {
        switch (type) {
          case "Dot":
            return LayerType.Dot;
          case "FilledPolygon":
            return LayerType.FilledPolygon;
          case "Polygon":
            return LayerType.Polygon;
          default:
            return LayerType.Line;
        }
      };

      const affineMatrix = data.getData(affineMatrixSource);
      const sourceImage = data.imgStack[sourceImgPos];
      const targetImage = data.imgStack[targetImgPos];

      const layerToProcess = layerIDs.map(layerData => {
        return {
          layerData: layerData,
          origLayer: FilterHelper.findLayer(sourceImage.layers, layerData.oldID)
        }
      });

      layerToProcess.forEach(x => {
        if (x.origLayer === null) {
          observer.error(`Layer ID not found ${x.layerData.oldID}!`);
        }
      });

      layerToProcess.forEach(layerData => {
        const nLayer = Object.assign(new Layer(""), layerData.origLayer);
        nLayer.lines = [];
        nLayer.id = layerData.layerData.newID;
        nLayer.name = layerData.layerData.name;
        nLayer.type = getLayerType(layerData.layerData.type);
        nLayer.color = layerData.layerData.color || "#fff";

        for (const {item, index} of layerData.origLayer.lines.map((item, index) => ({item, index}))) {
          if (affineTransformation) {
            const tmp = applyToPoints(affineMatrix, item);
            nLayer.lines.push(tmp.map(x => {
              // @ts-ignore
              return new Point(Math.round(x.x), Math.round(x.y));
            }));
          } else {
            const objs = Object.assign([], item);
            nLayer.lines.push(objs);
          }
        }
        targetImage.layers.push(nLayer)
      });

        observer.next(data);
        observer.complete();

      }
    ));
  }

  toBinary(sourceImgPos: number, binaryOptions?: BinaryOptions) {
    if (binaryOptions) {
      const maxifyOptions = {
        targetImagePos: binaryOptions.targetPos,
        threshold_r: binaryOptions.threshold,
        threshold_g: binaryOptions.threshold,
        threshold_b: binaryOptions.threshold
      };
      return this.maxifyColorChannel(sourceImgPos, maxifyOptions)
    } else {
      return this.maxifyColorChannel(sourceImgPos)
    }
  }

  thresholdByPercentile(sourcePos: number, targetImagePos: number, thresholdPercentileOptions?: ThresholdPercentileOptions) {
    return new ThresholdByPercentile(this.services).doFilter(sourcePos, targetImagePos, thresholdPercentileOptions);
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

  drawLayer({sourceImgPos = null, targetImgPos = null, layerIDs = null}: { sourceImgPos: number, targetImgPos: number, layerIDs: string[] }) {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(this.getImage(targetImgPos, data)).pipe(map(canvas => {

      const img = this.getImage(sourceImgPos, data);
      const targetImage = this.getImage(targetImgPos, data);

      if (img === null || targetImage === null) {
        return data;
      }

      let layers = [];

      if (layerIDs === null) {
        layers = img.layers
      } else {
        layerIDs.forEach(layer => {
          const result = FilterHelper.findLayer(img.layers, layer);
          if (result !== undefined) {
            layers.push(result);
          }
        })
      }

      const cx = canvas.getContext("2d");

      layers.forEach(layer => {
        DrawUtil.drawLayer(cx, layer);
      });

      FilterHelper.canvasToImage(canvas,targetImage);
      return data;
    })));
  }

  extractSubImage(sourcePos: number, extractionLayerID: string, targetPos: number) {
    return new ExtractSubImageFilter(this.services).doFilter(sourcePos, extractionLayerID, targetPos);
  }

  public toColorType(sourceImgPos: number, colorType: string, colorTypeOptions?: ColorTypeOptions) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {

        const source = this.getImage(sourceImgPos, data);
        const target = (colorTypeOptions && colorTypeOptions.targetImagePos) ? this.getImage(colorTypeOptions.targetImagePos, data) : source

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

  display(sourcePos: number = -1) {
    return new DisplayFilter(this.services).doFilter(sourcePos);
  }

  processCountedPixels(processCountedPixelsOptions?: ProcessCountedPixelsOptions) {
    return new ProcessCountedPixelsFilter(this.services).doFilter(processCountedPixelsOptions);
  }

  save(targetProject: string, saveOptions?: SaveOptions) {
    return new SaveFilter(this.services).doFilter(targetProject, saveOptions);
  }

  invertColors(sourcePos: number, targetPos: number = sourcePos, inverseFilterOptions?: InverseFilterOptions){
    return new InverseFilter(this.services).doFilter(sourcePos,targetPos,inverseFilterOptions);
  }

  outputData() {
    return new OutputFilter(this.services).doFilter();
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
