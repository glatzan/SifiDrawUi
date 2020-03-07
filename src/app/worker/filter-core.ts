import {ImageService} from "../service/image.service";
import {ProcessCallback} from "./processCallback";
import {DisplayCallback} from "./display-callback";
import {CImage} from "../model/CImage";
import {flatMap, map} from "rxjs/operators";
import {ICImage} from "../model/ICImage";
import {FilterData} from "./filter-data";
import {Observable} from "rxjs";
import {CImageGroup} from "../model/CImageGroup";
import {ImageGroupService} from "../service/image-group.service";
import {Layer} from "../model/layer";
import {applyToPoints, fromObject, fromTriangles, transform} from "transformation-matrix";
import {Point} from "../model/point";
import {LayerType} from "../model/layer-type.enum";
import {ColorType, PNG} from "pngjs";
import CImageUtil from "../utils/cimage-util";
import DrawUtil from "../utils/draw-util";

export class FilterCore {


  imageService: ImageService;

  imageGroupService: ImageGroupService;

  processCallback: ProcessCallback;

  displayCallback: DisplayCallback;


  constructor(processCallback?: ProcessCallback, displayCallback?: DisplayCallback) {

    this.processCallback = processCallback || {
      callback(): void {
      }
    } as ProcessCallback

    this.displayCallback = displayCallback || {
      displayCallBack(image: CImage): void {

      },
      addImage(image: CImage): void {

      }
    } as DisplayCallback
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

  createAffineTransformationMatrix({img1Pos = null, img2Pos = null, layerImg1ID = null, layerImg2ID = layerImg1ID, targetName = 'affineMatrix'}: { img1Pos: number, img2Pos: number, layerImg1ID: string, layerImg2ID: string, targetName?: string }) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
      console.log(`Create affine Matrix`);
      if (img1Pos < 0 || img1Pos >= data.imgStack.length || img2Pos < 0 || img2Pos >= data.imgStack.length) {
        observer.error(`Clone Image out of bounds IMG 1 ${img1Pos} or IMG 2 ${img2Pos}; Max size: ${data.imgStack.length}`);
      }

      const findLayer = function (layers: Layer[], id: string): Layer {
        for (let layer of layers) {
          if (layer.id == layerImg1ID) {
            return layer;
          }
        }
        return null
      };

      const img1 = data.imgStack[img1Pos];
      const img2 = data.imgStack[img2Pos];

      const layer1 = findLayer(img1.layers, layerImg1ID);
      const layer2 = findLayer(img2.layers, layerImg2ID);

      if (layer1 === null || layer2 === null || layer1.lines.length == 0) {
        observer.error(`Layer not found on IMG 1 ${layerImg1ID} or IMG 2 ${layerImg2ID};`);
      }

      if (layer1.lines[0].length < 3 || layer2.lines.length == 0 || layer2.lines[0].length !== layer1.lines[0].length) {
        observer.error(`Three dots in layer (line 1) needed Layer 1 ${layerImg1ID} or Layer 2 ${layerImg2ID};`);
      }

      const t1 = layer1.lines[0].map(x => {
        return {x: x.x, y: x.y}
      });
      const t2 = layer2.lines[0].map(x => {
        return {x: x.x, y: x.y}
      });

      const resultArrs = [];

      for (let i = 0; i < t1.length - 2; i++) {
        resultArrs.push(fromTriangles(t1.slice(i, i + 3), t2.slice(i, i + 3)));
        console.log(resultArrs[i])
      }

      let t = { a : 0,b :0,c:0,d:0,e:0,f:0};
      resultArrs.forEach( x =>{
        t.a += x.a;
        t.b += x.b;
        t.c += x.c;
        t.d += x.d;
        t.e += x.e;
        t.f += x.f;
      })

      t.a = t.a /resultArrs.length;
      t.b = t.b /resultArrs.length;
      t.c = t.c /resultArrs.length;
      t.d = t.d/resultArrs.length;
      t.e = t.e/resultArrs.length;
      t.f = t.f/resultArrs.length;

      const test = fromObject(t);


      const result = transform(resultArrs);

      console.log(result)
      console.log(test)

      data.setData(targetName, test);

      observer.next(data);
      observer.complete();
    }));
  }

  applyTransformation(sourceImgPos, targetImgPos = sourceImgPos, applyTransformationOptions?: ApplyTransformationOptions) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {

      const source = FilterCore.getImage(sourceImgPos, data);
      const target = FilterCore.getImage(targetImgPos, data);

      if (!applyTransformationOptions)
        applyTransformationOptions = {}

      if (!applyTransformationOptions.sourceData)
        applyTransformationOptions.sourceData = "affineMatrix";

      const transformation = data.getData(applyTransformationOptions.sourceData);

      if (!source || !target || !transformation) {
        observer.error("Target or source not found")
      }

      const buff = new Buffer(source.data, 'base64');
      const png = PNG.sync.read(buff);

      const canvas = document.createElement("canvas");
      canvas.width = png.width;
      canvas.height = png.height;
      const cx = canvas.getContext("2d");

      const canvasResult = document.createElement("canvas");
      canvasResult.width = png.width;
      canvasResult.height = png.height;
      const cx2 = canvasResult.getContext("2d");

      const array = new Uint8ClampedArray(png.data);
      const imageData = new ImageData(array, cx.canvas.width, cx.canvas.height);

      cx.putImageData(imageData, 0, 0);

      cx2.transform(transformation.a, transformation.b, transformation.c, transformation.d, transformation.e, transformation.f);
      cx2.drawImage(canvas, 0, 0);

      target.data = DrawUtil.canvasAsBase64(canvasResult);
      observer.next(data);
      observer.complete();
    }));
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
            const objs = Object.assign([], item)
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

      const img = FilterCore.getImage(sourceImgPos, data);

      if (img === null) {
        observer.error(`Image not found index ${sourceImgPos}!`);
      }

      let targetImage = img;
      if (maxifyOptions.targetImagePos !== undefined) {
        targetImage = FilterCore.getImage(maxifyOptions.targetImagePos, data);
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

      const source = FilterCore.getImage(sourceImgPos, data);
      const target = (countPixelsOptions.targetImagePos) ? FilterCore.getImage(countPixelsOptions.targetImagePos, data) : null;

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

  merge(imageOnePos: number, imageTwoPos: number, targetImagePos: number = imageOnePos) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
      const imgOne = FilterCore.getImage(imageOnePos, data);
      const imgTwo = FilterCore.getImage(imageTwoPos, data);
      const targetImage = FilterCore.getImage(targetImagePos, data);

      if (imgOne === null || imgTwo === null || targetImage === null) {
        observer.error(`Image not found index img 1 ${imageOnePos} or img 2 ${imageTwoPos} or target ${targetImage}!`);
      }

      const buff1 = new Buffer(imgOne.data, 'base64');
      const png1 = PNG.sync.read(buff1);

      const buff2 = new Buffer(imgTwo.data, 'base64');
      const png2 = PNG.sync.read(buff2);

      const dst = new PNG({width: png1.width, height: png1.height, colorType: 2});

      if (png1.width > png2.width || png1.height > png2.height) {
        observer.error(`Image two must be equal or bigger in size ${png1.width} - ${png2.width} / ${png1.height} - ${png2.height}`);
      }

      for (let y = 0; y < png1.height; y++) {
        for (let x = 0; x < png1.width; x++) {
          const idx = (png1.width * y + x) << 2;
          dst.data[idx] = png1.data[idx] | png2.data[idx];
          dst.data[idx + 1] = png1.data[idx + 1] | png2.data[idx + 1];
          dst.data[idx + 2] = png1.data[idx + 2] | png2.data[idx + 2];
          dst.data[idx + 3] = 255
        }
      }
      const targetBuff = PNG.sync.write(dst, {colorType: 2});
      const tmo = targetBuff.toString('base64')
      targetImage.data = targetBuff.toString('base64');
      observer.next(data);
      observer.complete();
    }));
  }

  histogram(imageOnePos: number, channel: number, histogramOptions?: HistogramOptions) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
      const source = FilterCore.getImage(imageOnePos, data);

      if (!histogramOptions)
        histogramOptions = {};

      if (!histogramOptions.targetData)
        histogramOptions.targetData = "histogram";

      let target = null;

      if (histogramOptions.targetImagePos)
        target = FilterCore.getImage(histogramOptions.targetImagePos, data);

      if (source === null) {
        observer.error(`Image not found index img 1 ${imageOnePos} or target ${target}!`);
      }

      if (channel < 0 || channel > 2) {
        observer.error(`Channgel r = 0, g = 1, b = 2`);
      }

      const buff1 = new Buffer(source.data, 'base64');
      const png1 = PNG.sync.read(buff1);

      const result = new Array<number>(256).fill(0);

      let i = 0;
      for (let y = 0; y < png1.height; y++) {
        for (let x = 0; x < png1.width; x++) {
          const t = png1.data[i + channel];
          result[t] += 1;
          i += 4;
        }
      }

      if (target) {
        const canvas = document.createElement("canvas");
        canvas.width = 510;
        canvas.height = 510;
        const cx = canvas.getContext("2d");

        const max = result.reduce((a,b)=>a>b?a:b);

        for (let i = 0; i < result.length; i++) {
          const height = (result[i] * 510) / max;
          DrawUtil.drawRect(cx, i * 2, 510 - height, 2, height, "#000");
        }

        target.data = DrawUtil.canvasAsBase64(canvas);
      }


      data.pushData(histogramOptions.targetData, result);
      console.log(result)
      observer.next(data);
      observer.complete();
    }));
  }

  /**
   * @param width
   * @param height
   * @param color
   * @param imageType 0 (grayscale -> grey), colortype 2 (RGB -> rgb), colortype 4 (grayscale alpha -> greya) and colortype 6 (RGBA -> rgba)
   */
  createImage(createImageOptions?: CreateImageOptions) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {

      if (!createImageOptions) {
        createImageOptions = {};
      }

      if (!createImageOptions.backgroundColor) {
        createImageOptions.backgroundColor = "#000"
      }

      if (!createImageOptions.colorType) {
        createImageOptions.colorType = 0
      }

      if (createImageOptions.referenceImagePos) {
        const refIMG = FilterCore.getImage(createImageOptions.referenceImagePos, data);
        if (refIMG) {
          createImageOptions.width = refIMG.width || 1000;
          createImageOptions.height = refIMG.height || 1000;
        }
      }

      if (createImageOptions.width === -1 || !createImageOptions.width) {
        createImageOptions.width = data.img.width || 1000;
      }

      if (createImageOptions.height == -1 || !createImageOptions.height) {
        createImageOptions.height = data.img.height || 1000;
      }

      const canvas = document.createElement("canvas");
      canvas.width = createImageOptions.width;
      canvas.height = createImageOptions.height;
      const cx = canvas.getContext("2d");
      DrawUtil.drawRect(cx, 0, 0, createImageOptions.width, createImageOptions.height, createImageOptions.backgroundColor);

      const image = new CImage();
      image.id = "tmp";
      image.name = "tmp";
      image.fileExtension = "png";
      image.width = createImageOptions.width;
      image.height = createImageOptions.height;
      CImageUtil.prepareImage(image);
      image.data = DrawUtil.canvasAsBase64(canvas);

      this.pushAndAddImageToStack(image, data);

      observer.next(data);
      observer.complete();
    }));
  }

  drawLayer({sourceImgPos = null, targetImgPos = null, layerIDs = null}: { sourceImgPos: number, targetImgPos: number, layerIDs: string[] }) {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(FilterCore.getImage(targetImgPos, data)).pipe(map(canvas => {

      const img = FilterCore.getImage(sourceImgPos, data);
      const targetImage = FilterCore.getImage(targetImgPos, data);

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
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(FilterCore.getImage(sourceImgPos, data)).pipe(map(canvas => {

      const img = FilterCore.getImage(sourceImgPos, data);
      const targetImage = FilterCore.getImage(targetImgPos, data);

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

        const source = FilterCore.getImage(sourceImgPos, data);
        const target = (colorTypeOptions && colorTypeOptions.targetImagePos) ? FilterCore.getImage(colorTypeOptions.targetImagePos, data) : source

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

      this.displayCallback.displayCallBack(data.imgStack[imgPos]);

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

      this.processCallback.displayData(result);

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
      if (saveOptions.sourceImage !== undefined && FilterCore.getImage(saveOptions.sourceImage, data) !== null) {
        sourceImage = FilterCore.getImage(saveOptions.sourceImage, data);
      }

      const saveImage = Object.assign(new CImage(), sourceImage);
      saveImage.id = btoa(targetImgName);
      saveImage.name = imgName

      if (!saveOptions.saveLayers) {
        saveImage.layers = [];
      }

      observer.next({data: data, img: saveImage});
      observer.complete();
    }).pipe(flatMap(data => this.imageService.createImage(data.img, 'png').pipe(
      map(newImg => {
        return data.data;
      }))
    )));
  }

  private pushAndAddImageToStack(img: CImage, data: FilterData) {
    data.pushIMG(img);
    this.displayCallback.addImage(img);
  }

  private loadICImage(img: ICImage): Observable<ICImage> {
    if (img instanceof CImage) {
      return this.imageService.getImage(img.id);
    } else {
      return this.imageGroupService.getImageGroup(img.id);
    }
  }

  private static getImage(index: number, data: FilterData): CImage {
    if (index < 0 || index >= data.imgStack.length) {
      return null;
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

  // function componentToHex(c: number) {
  //   const hex = c.toString(16);
  //   return hex.length == 1 ? "0" + hex : hex;
  // }
  //
  // function rgbToHex(r, g, b): string {
  //   return componentToHex(r) + componentToHex(g) + componentToHex(b);
  // }
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

export interface CreateImageOptions {
  width?: number;
  height?: number;
  referenceImagePos?: number;
  colorType?: ColorType;
  backgroundColor?: string;
}

export interface ApplyTransformationOptions {
  sourceData?: string;
}

export interface HistogramOptions {
  targetImagePos?: number
  targetData?: string
  clipMin?: number
  clipMax?: number
  max?: number
}
