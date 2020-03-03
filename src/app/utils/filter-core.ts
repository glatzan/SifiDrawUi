import {ImageService} from "../service/image.service";
import {ProcessCallback} from "../worker/processCallback";
import {DisplayCallback} from "../worker/display-callback";
import {CImage} from "../model/CImage";
import {flatMap, map} from "rxjs/operators";
import {ICImage} from "../model/ICImage";
import {FilterData} from "../worker/filter-data";
import {Observable} from "rxjs";
import {CImageGroup} from "../model/CImageGroup";
import {ImageGroupService} from "../service/image-group.service";
import {Layer} from "../model/layer";
import {applyToPoints, fromTriangles} from "transformation-matrix";
import {Point} from "../model/point";
import {LayerType} from "../model/layer-type.enum";
import {ColorType, PNG} from "pngjs";
import CImageUtil from "./cimage-util";
import DrawUtil from "./draw-util";

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
      filterData.origName = atob(cimg.id);
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

      if (layer1 === null || layer2 === null || layer1.lines.length <= 0) {
        observer.error(`Layer not found on IMG 1 ${layerImg1ID} or IMG 2 ${layerImg2ID};`);
      }

      if (layer1.lines[0].length < 3 || layer2.lines.length <= 0 || layer2.lines[0].length < 3) {
        observer.error(`Three dots in layer (line 1) needed Layer 1 ${layerImg1ID} or Layer 2 ${layerImg2ID};`);
      }

      const t1 = layer1.lines[0].slice(0, 3).map(x => {
        return {x: x.x, y: x.y}
      });
      const t2 = layer2.lines[0].slice(0, 3).map(x => {
        return {x: x.x, y: x.y}
      });

      const resultMatrix = fromTriangles(t1, t2);

      console.log(resultMatrix);

      data.setData(targetName, resultMatrix);

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

  countVolume({sourceImgPos = null, targetImgPos = null}: { sourceImgPos: number, targetImgPos: number }) {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(FilterCore.getImage(targetImgPos, data).data).pipe(map(canvas => {

      function componentToHex(c: number) {
        const hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
      }

      function rgbToHex(r, g, b): string {
        return componentToHex(r) + componentToHex(g) + componentToHex(b);
      }

      const img = FilterCore.getImage(sourceImgPos, data)
      const buff = new Buffer(img.data, 'base64');
      const png = PNG.sync.read(buff);

      for (let x = 0; x < png.width; x++) {
        for (let y = 0; y < png.height; y++) {
          const idx = (png.width * y + x) << 2;
          if (png.data[idx] > 100) {
            console.log("asd")
          }
          const color = rgbToHex(png.data[idx], png.data[idx + 1], png.data[idx + 2]);
          if (color !== "000000")
            console.log(color);
        }
      }
      return data;
    })));
  }

  /**
   * @param width
   * @param height
   * @param color
   * @param imageType 0 (grayscale -> grey), colortype 2 (RGB -> rgb), colortype 4 (grayscale alpha -> greya) and colortype 6 (RGBA -> rgba)
   */
  createImage({width = 1000, height = 1000, color = "#00000", imageType = "0"}: { width: number, height: number, color: string, imageType: string }) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const cx = canvas.getContext("2d");
      DrawUtil.drawRect(cx, 0, 0, width, height, color);

      const image = new CImage();
      image.id = "tmp";
      image.name = "tmp";
      CImageUtil.prepareImage(image);
      image.data = DrawUtil.canvasAsBase64(canvas);

      this.pushAndAddImageToStack(image, data);

      observer.next(data);
      observer.complete();
    }));
  }

  drawLayer({sourceImgPos = null, targetImgPos = null, layerIDs = null}: { sourceImgPos: number, targetImgPos: number, layerIDs: string[] }) {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(FilterCore.getImage(targetImgPos, data).data).pipe(map(canvas => {

      const img = FilterCore.getImage(sourceImgPos, data);

      if (img === null) {
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

      console.log(layers)
      layers.forEach(layer => {
        layer.lines.forEach(lines => {
          DrawUtil.drawLinesOnCanvas(cx, lines, layer.color, layer.size);
        })
      });

      data.img.data = DrawUtil.canvasAsBase64(canvas);

      return data;
    })));
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

  public colorType() {
    const getColorType = function (type: string): ColorType {
      switch (type) {
        case "rgb":
          return 0;
        case "greya":
          return 4;
        case "rgba":
          return 6;
        default:
          return 0;
      }
    };
  }

  private pushAndAddImageToStack(img: CImage, data: FilterData) {
    data.pushIMG(img);
    this.displayCallback.addImage(img);
  }

  private loadICImage(img: ICImage):
    Observable<ICImage> {
    if (img instanceof CImageGroup
    ) {
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
      console.log(layer.id + " == " + id);
      if (layer.id == id) {
        return layer;
      }
    });
  }

}
