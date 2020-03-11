import {CImage} from "../model/CImage";
import {flatMap, map} from "rxjs/operators";
import {ICImage} from "../model/ICImage";
import {FilterData} from "./filter-data";
import {Observable} from "rxjs";
import {CImageGroup} from "../model/CImageGroup";
import {Layer} from "../model/layer";
import {applyToPoints} from "transformation-matrix";
import {Point} from "../model/point";
import {LayerType} from "../model/layer-type.enum";
import {ColorType, PNG} from "pngjs";
import DrawUtil from "../utils/draw-util";
import {ContrastFilter} from "./filter/contrast-filter";
import {Services} from "./filter/abstract-filter";
import {FilterHelper} from "./filter/filter-helper";
import {AffineTransformationMatrixFilter} from "./filter/affine-transformation-matrix-filter";
import {CreateImageFilter, CreateImageOptions} from "./filter/create-image-filter";
import {HistogramFilter, HistogramOptions} from "./filter/histogram-filter";
import {MergeFilter} from "./filter/merge-filter";
import {ApplyTransformationFilter} from "./filter/apply-transformation-filter";

export class FilterCore {

  services: Services;

  constructor(services: Services) {
    this.services = services;
  }

  load() {
    return flatMap((data: ICImage) => this.loadICImage(data).pipe(map(cimg => {
      console.log(`Load img ${atob(cimg.id)}`);
      const filterData = new FilterData();
      filterData.pushICIMG(cimg);
      filterData.originalImage = cimg;
      return filterData;
    })));
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
          origLayer: FilterCore.findLayer(sourceImage.layers, layerData.oldID)
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
    if (binaryOptions !== undefined) {
      const maxifyOptions = {
        targetProject: binaryOptions.targetImagePos,
        threshold_r: binaryOptions.threshold,
        threshold_g: binaryOptions.threshold,
        threshold_b: binaryOptions.threshold
      };
      return this.maxifyColorChannel(sourceImgPos, maxifyOptions)
    } else {
      return this.maxifyColorChannel(sourceImgPos)
    }
  }

  maxifyColorChannel(sourceImgPos: number, maxifyOptions?: MaxifyOptions) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {

      if (maxifyOptions === undefined)
        maxifyOptions = {};

      const img = this.getImage(sourceImgPos, data);

      if (img === null) {
        observer.error(`Image not found index ${sourceImgPos}!`);
      }

      let targetImage = img;
      if (maxifyOptions.targetImagePos !== undefined) {
        targetImage = this.getImage(maxifyOptions.targetImagePos, data);
        if (img === null) {
          observer.error(`TargetImage not found index ${maxifyOptions.targetImagePos}!`);
        }
      }

      const r = maxifyOptions.threshold_r !== undefined ? maxifyOptions.threshold_r : 256;
      const g = maxifyOptions.threshold_g !== undefined ? maxifyOptions.threshold_g : 256;
      const b = maxifyOptions.threshold_b !== undefined ? maxifyOptions.threshold_b : 256;

      const buff = new Buffer(img.data, 'base64');
      const png = PNG.sync.read(buff);

      for (let x = 0; x < png.width; x++) {
        for (let y = 0; y < png.height; y++) {
          const idx = (png.width * y + x) << 2;

          if (png.data[idx] >= r) {
            png.data[idx] = 255;
          }
          if (png.data[idx + 1] >= g) {
            png.data[idx + 1] = 255;
          }

          if (png.data[idx] >= b) {
            png.data[idx + 2] = 255;
          }
        }
      }

      const buffer = PNG.sync.write(png, {colorType: 2});
      targetImage.data = buffer.toString('base64');

      observer.next(data);
      observer.complete();
    }));
  }

  threshold(sourceImgPos: number, countPixelsOptions?: ThresholdOptions) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
      if (countPixelsOptions === undefined)
        countPixelsOptions = {};

      let r, g, b = -1
      if (countPixelsOptions.threshold_grey) {
        r = countPixelsOptions.threshold_grey;
      } else {
        r = countPixelsOptions.threshold_r !== undefined ? countPixelsOptions.threshold_r : -1;
        g = countPixelsOptions.threshold_g !== undefined ? countPixelsOptions.threshold_g : -1;
        b = countPixelsOptions.threshold_b !== undefined ? countPixelsOptions.threshold_b : -1;
      }

      if (!countPixelsOptions.targetData)
        countPixelsOptions.targetData = "countData";

      const source = this.getImage(sourceImgPos, data);
      const target = (countPixelsOptions.targetImagePos) ? this.getImage(countPixelsOptions.targetImagePos, data) : null;

      if (source === null) {
        observer.error(`Image not found index ${sourceImgPos}!`);
      }


      const buff = new Buffer(source.data, 'base64');
      const png = PNG.sync.read(buff);
      const targetPNG = new PNG({width: png.width, height: png.height});

      let counter = 0;

      for (let x = 0; x < png.width; x++) {
        for (let y = 0; y < png.height; y++) {
          const idx = (png.width * y + x) << 2;
          let c = true;

          if (r != -1) {
            if (png.data[idx] < r)
              c = false;
          }

          if (g != -1) {
            if (png.data[idx + 1] < g)
              c = false;
          }

          if (b != -1) {
            if (png.data[idx + 2] < b)
              c = false;
          }

          if (c) {
            counter++;
            if (target) {
              targetPNG.data[idx] = png.data[idx];
              targetPNG.data[idx + 1] = png.data[idx + 1];
              targetPNG.data[idx + 2] = png.data[idx + 2];
              targetPNG.data[idx + 3] = png.data[idx + 3];
            }
          }
        }
      }

      console.log("count" + counter);

      if (target) {
        const targetBuff = PNG.sync.write(targetPNG, {colorType: 2});
        target.data = targetBuff.toString('base64');
      }

      const entry = {tag: sourceImgPos.toString(), name: source.name, value: counter};
      data.pushData(countPixelsOptions.targetData, entry)

      observer.next(data);
      observer.complete();
    }));
  }

  merge(sourcePos: number, sourcePos2: number, targetPos: number = sourcePos) {
    return new MergeFilter(this.services).doFilter(sourcePos, sourcePos2, targetPos)
  }

  contrast(sourcePos: number, contrastOptions?: ContrastOptions) {
    if (!contrastOptions)
      contrastOptions = {};
    if (!contrastOptions.targetPos)
      contrastOptions.targetPos = sourcePos;
    if (!contrastOptions.contrast)
      contrastOptions.contrast = 1;
    return new ContrastFilter(this.services).doFilter(sourcePos, contrastOptions)
  }


  histogram(imageOnePos: number, channel: number, histogramOptions?: HistogramOptions) {
    if (!histogramOptions)
      histogramOptions = {};

    if (!histogramOptions.targetData)
      histogramOptions.targetData = "histogram";

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
          const result = FilterCore.findLayer(img.layers, layer);
          if (result !== undefined) {
            layers.push(result);
          }
        })
      }

      const cx = canvas.getContext("2d");

      layers.forEach(layer => {
        DrawUtil.drawLayer(cx, layer);
      });

      targetImage.data = DrawUtil.canvasAsBase64(canvas);
      return data;
    })));
  }

  extractSubImage(sourceImgPos: number, targetImgPos: number, polygonLayer: string) {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(this.getImage(sourceImgPos, data)).pipe(map(canvas => {

      const img = this.getImage(sourceImgPos, data);
      const targetImage = this.getImage(targetImgPos, data);

      if (img == null || targetImage == null) {
        return data;
      }

      const layer = FilterCore.findLayer(img.layers, polygonLayer);

      if (layer == null) {
        return data;
      }

      const canvas2 = document.createElement("canvas");
      canvas2.width = canvas.width;
      canvas2.height = canvas.height;
      const cx2 = canvas2.getContext("2d");
      DrawUtil.drawRect(cx2, 0, 0, canvas2.width, canvas2.height, "#000");

      const cx = canvas.getContext("2d");
      DrawUtil.drawPolygons(cx2, layer.lines, 1, "#fff", true, false, true);
      cx2.drawImage(canvas, 0, 0, canvas2.width, canvas2.height, 0, 0, canvas2.width, canvas2.height);
      targetImage.data = DrawUtil.canvasAsBase64(canvas2);
      return data;
    })));
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

  display({imgPos = -1}: { imgPos: number }) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
      console.log(`Display img ${imgPos} of ${data.imgStack.length}`);

      if (imgPos === -1)
        imgPos = data.imgStack.length - 1;

      if (imgPos < 0 || imgPos >= data.imgStack.length) {
        observer.error(`Clone Image out of bounds IMG ${imgPos}`);
      }

      this.services.displayCallback.displayCallBack(data.imgStack[imgPos]);

      observer.next(data);
      observer.complete();
    }));
  }

  processCountedPixels(processCountedPixelsOptions?: ProcessCountedPixelsOptions) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {

      if (!processCountedPixelsOptions) {
        processCountedPixelsOptions = {};
      }

      if (!processCountedPixelsOptions.sourceData) {
        processCountedPixelsOptions.sourceData = "countData";
      }

      if (!processCountedPixelsOptions.pixelInMM) {
        processCountedPixelsOptions.pixelInMM = 1;
      }

      const counts = data.getData(processCountedPixelsOptions.sourceData );

      let result = "Ergebniss <br>";

      console.log(processCountedPixelsOptions.pixelInMM)
      for (let count of counts) {
        result += `ID: ${count.tag} &emsp;  Value: ${count.value} &emsp; Volume: ${count.value * processCountedPixelsOptions.pixelInMM} mm2<br>`
      }

      this.services.processCallback.displayData(result);

      observer.next(data);
      observer.complete();
    }));
  }

  save(targetProject: string, saveOptions?: SaveOptions) {
    return flatMap((data: FilterData) => new Observable<{ data: FilterData, img: CImage }>((observer) => {

      if (saveOptions === undefined)
        saveOptions = {};

      let fullImgName = atob(data.originalImage.id);
      let imgName = data.originalImage.name;

      if (data.originalImage instanceof CImageGroup) {
        // remove last /
        fullImgName = fullImgName.slice(0, -1);
        fullImgName = fullImgName.slice(0, fullImgName.lastIndexOf("/") + 1);
        fullImgName += data.originalImage.name
      } else {
        imgName = fullImgName.slice(fullImgName.lastIndexOf("/") + 1, -1);
      }

      const dataset = fullImgName.substr(0, fullImgName.lastIndexOf("/") + 1);

      let targetDataset = targetProject + "/filtered";


      if (saveOptions.datasetMapping !== undefined) {
        targetDataset = targetProject + saveOptions.datasetMapping;
      } else if (saveOptions.datasetsMapping !== undefined) {
        for (let i = 0; i < saveOptions.datasetsMapping.length; i++) {
          if (dataset === saveOptions.datasetsMapping[i].dataset) {
            targetDataset = targetProject + saveOptions.datasetsMapping[i].mapping;
            break;
          }
        }
      }

      if (targetDataset.charAt(targetDataset.length - 1) !== '/') {
        targetDataset += "/"
      }


      let targetImgName = targetDataset;

      if (saveOptions.addDatasetAsPrefix) {
        targetImgName += dataset.replace('/', '-') + '-';
      }

      targetImgName += imgName;

      if (saveOptions.imageSuffix !== undefined) {
        targetImgName += saveOptions.imageSuffix;
      }

      if (!targetImgName.endsWith(".png"))
        targetImgName += ".png";

      let sourceImage = data.img;
      if (saveOptions.sourceImage !== undefined && this.getImage(saveOptions.sourceImage, data) !== null) {
        sourceImage = this.getImage(saveOptions.sourceImage, data);
      }

      const saveImage = Object.assign(new CImage(), sourceImage);
      saveImage.id = btoa(targetImgName);
      saveImage.name = imgName

      if (!saveOptions.saveLayers) {
        saveImage.layers = [];
      }

      observer.next({data: data, img: saveImage});
      observer.complete();
    }).pipe(flatMap(data => this.services.imageService.createImage(data.img, 'png').pipe(
      map(newImg => {
        return data.data;
      }))
    )));
  }

  private pushAndAddImageToStack(img: CImage, data: FilterData) {
    data.pushIMG(img);
    this.services.displayCallback.addImage(img);
  }

  private loadICImage(img: ICImage): Observable<ICImage> {
    if (img instanceof CImage) {
      return this.services.imageService.getImage(img.id);
    } else {
      return this.services.imageGroupService.getImageGroup(img.id);
    }
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

  private static findLayer(layers: Layer[], id: string): Layer {
    return layers.find(layer => {
      if (layer.id == id) {
        return layer;
      }
    });
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

export interface SaveOptions {
  targetProject?: string
  datasetsMapping?: [{ dataset: string, mapping: string }]
  datasetMapping?: string
  addDatasetAsPrefix?: boolean
  saveLayers?: boolean
  imageSuffix?: string
  sourceImage?: number
}

export interface MaxifyOptions {
  targetImagePos?: number
  threshold_r?: number
  threshold_g?: number
  threshold_b?: number
}

export interface BinaryOptions {
  targetImagePos?: number
  threshold?: number
}

export interface ThresholdOptions {
  targetData?: string
  targetTag?: string
  threshold_r?: number
  threshold_g?: number
  threshold_b?: number
  threshold_grey?: number
  targetImagePos?: number
}

export interface ProcessCountedPixelsOptions {
  sourceData?: string
  pixelInMM?: number
}

export interface ColorTypeOptions {
  targetImagePos?: number
}

export interface ContrastOptions {
  targetPos?: number
  contrast?: number
}
