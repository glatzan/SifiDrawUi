import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {LayerType} from "../../model/layer-type.enum";
import {FilterHelper} from "./filter-helper";
import {ColorType} from "pngjs";
import {Layer} from "../../model/layer";
import {applyToPoints} from "transformation-matrix";
import {Point} from "../../model/point";

export class CopyLayerToImageFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, layers: [CopyLayerData], copyLayerToImageOptions?: CopyLayerToImageOptions) {
    return map((data: FilterData) => {

      if (!copyLayerToImageOptions)
        copyLayerToImageOptions = {};

      if (!copyLayerToImageOptions.targetPos)
        copyLayerToImageOptions.targetPos = sourcePos;

      if (!copyLayerToImageOptions.colorType)
        copyLayerToImageOptions.colorType = 2;

      if (!copyLayerToImageOptions.affineTransformation)
        copyLayerToImageOptions.affineTransformation = false;
      else {
        if (!copyLayerToImageOptions.affineMatrixSource)
          copyLayerToImageOptions.affineMatrixSource = "affineMatrix";
      }

      const [source, target] = this.getSourceAndTarget(data, sourcePos, copyLayerToImageOptions.targetPos);

      if (!target)
        throw new Error(`CopyLayerToImageFilter: Target not found index ${copyLayerToImageOptions.targetPos}!`);


      if (!layers || layers.length <= 0)
        throw new Error(`CopyLayerToImageFilter: No Layer provided!`);

      const sourceImg = FilterHelper.imageToPNG(source);

      const affineMatrix = data.getData(copyLayerToImageOptions.affineMatrixSource);

      const layerToProcess = layers.map(layerData => {
        return {
          layerData: layerData,
          origLayer: FilterHelper.findLayer(source.layers, layerData.oldID)
        }
      });

      layerToProcess.forEach(x => {
        if (x.origLayer === null)
          throw new Error(`CopyLayerToImageFilter: Layer ID not found ${x.layerData.oldID}!`);
      });

      layerToProcess.forEach(layerData => {
        const nLayer = Object.assign(new Layer(""), layerData.origLayer);
        nLayer.lines = [];
        nLayer.id = layerData.layerData.newID;
        nLayer.name = layerData.layerData.name;
        nLayer.type = this.getLayerType(layerData.layerData.type);
        nLayer.color = layerData.layerData.color || "#fff";

        for (const {item, index} of layerData.origLayer.lines.map((item, index) => ({item, index}))) {
          if (copyLayerToImageOptions.affineTransformation) {
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
        target.layers.push(nLayer)
      });

      return data;

    });
  }

  private getLayerType(type: string): LayerType {
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
}


export interface CopyLayerToImageOptions {
  targetPos?: number
  affineTransformation?: boolean
  affineMatrixSource?: string
  colorType?: ColorType
}

export interface CopyLayerData {
  color?: string,
  name?: string,
  oldID: string,
  newID?: string,
  type?: string
}
