import {SImage} from '../model/SImage';
import {Layer} from '../model/layer';
import {Point} from '../model/point';
import {SAImage} from '../model/SAImage';
import {SImageGroup} from '../model/SImageGroup';
import {LayerType} from "../model/layer-type.enum";
import {CanvasHistory, LineHistory} from "../components/workView/draw-canvas/canvas-hisotry";
import VectorUtils from "./vector-utils";

export default class CImageUtil {

  static colors = ['#FFFFFF', '#2919ff', '#FF33FF', '#FFFF99', '#00B3E6',
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
    '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
    '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
    '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
    '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

  static prepare(img: SAImage): SAImage {
    if (img instanceof SImageGroup)
      return this.prepareImageGroup(img);
    else if (img instanceof SImage)
      return this.prepareImage(img);
    else
      return img
  }

  static prepareImageGroup(group: SImageGroup): SImageGroup {
    for (const img of group.images) {
      CImageUtil.prepareImage(img);
    }
    return group;
  }

  static prepareImage(image: SImage): SImage {
    if (!CImageUtil.hasLayer(image)) {
      CImageUtil.addLayer(image);
    }

    for (const layer of image.layers) {
      if (layer.line === undefined) {
        if (CImageUtil.hasLines(layer)) {
          CImageUtil.initFirstLineOfLayer(layer);
        } else {
          CImageUtil.addLine(layer);
        }
      }

      CImageUtil.updatePointOrders(layer.lines);
    }

    return image;
  }

  static initFirstLineOfLayer(layer: Layer): Point[] {
    if (layer.lines === undefined || layer.lines.length === 0) {
      return layer.line = CImageUtil.addLine(layer);
    }
    return layer.line = layer.lines[0];
  }

  static initLastLineOfLayer(layer: Layer): Point[] {
    if (layer.lines === undefined || layer.lines.length === 0) {
      return layer.line = CImageUtil.addLine(layer);
    }
    return layer.line = layer.lines[layer.lines.length - 1];
  }

  static addLine(layer: Layer): Point[] {
    layer.lines.push([]);
    return layer.line = layer.lines[layer.lines.length - 1];
  }

  static hasLines(layer: Layer): boolean {
    return layer.lines !== undefined && layer.lines.length !== 0;
  }

  static removeLine(layer: Layer, line: Point[]) {

    if (layer.lines.length === 1) {
      return;
    }

    let i = 0;
    for (const ll of layer.lines) {
      if (ll === line) {
        layer.lines.splice(i, 1);
        break;
      }
      i++;
    }

    if (layer.line === line) {
      layer.line = layer.lines[i - 1];
    }
  }

  static addPointToCurrentLine(layer: Layer, p: Point): LineHistory {
    return new LineHistory(null, [CImageUtil.addPointToLine(layer, layer.line, p)], CImageUtil.getLinePosition(layer, layer.line))
  }

  static addPointToLine(layer: Layer, line: Point[], p: Point): Point {
    const np = new Point(p.x, p.y, line.length);
    line.push(np);
    return np;
  }

  static addPointsToLineAtPosition(line: Point[], points: Point[]) {
    points.forEach(x => {
      if (x.pos >= line.length)
        line.push(x);
      else
        line.splice(x.pos, 0, x);
    })
  }

  static removePointFromCurrentLine(layer: Layer, point: Point) {
    CImageUtil.removePointFromLine(layer.line, point);
  }

  static removePointFromLine(line: Point[], point: Point) {
    let i = line.length;
    while (i--) {
      if (line[i].pos === point.pos) {
        line.splice(i, 1);
        return;
      }
    }
  }

  static updatePointOrders(points: Point[][]) {
    points.forEach(point => this.updatePointOrder(point))
  }

  static updatePointOrder(points: Point[]) {
    points.forEach((x, index) => {
      x.pos = index;
    });
  }

  static removeCollidingPointListsOfCircle(layer: Layer, lines: Point[][], origin: Point, radius: number): LineHistory[] {
    const removedPoints = VectorUtils.removeCollidingPointListsOfCircle(lines, origin, radius);
    if (removedPoints.length > 0) {
      CImageUtil.updatePointOrders(lines);
      return removedPoints.map(x => {
        return new LineHistory(x.points, null, x.lineIndex);
      });
    }
    return null;
  }

  static movePointListsToCircleBoundaries(layer: Layer, points: Point[][], origin: Point, radius: number, addHelperPoints: boolean, helperPointDistance: number, history: CanvasHistory, mergeHistory: boolean = true) {
    //const movedPoints = VectorUtils.movePointListsToCircleBoundaries(this.currentLayer.lines, new Point(pt.x, pt.y), this.displaySettings.eraserSize, this.currentLayer.type !== LayerType.Dot)
  }

  static findOrAddLayer(image: SAImage, layerID: string, layerPresets?: Layer[]) {
    if (!CImageUtil.hasLayer(image)) {
      return CImageUtil.addLayer(image, layerPresets, layerID);
    } else {
      const tmp = CImageUtil.findLayer(image, layerID);
      if (tmp != null) {
        return tmp;
      }
      return CImageUtil.addLayer(image, layerPresets, layerID);
    }
  }

  static getCurrentLinePosition(layer: Layer) {
    return CImageUtil.getLinePosition(layer, layer.line);
  }

  static getLinePosition(layer: Layer, sline: Point[]) {
    let i = 0;
    for (let line of layer.lines) {
      if (sline == line)
        return i;
      i++;
    }
    return -1;
  }

  static findLayer(image: SAImage, layerID: string) {
    for (const layer of image.getLayers()) {
      if (layer.id == layerID) {
        return layer;
      }
    }
    return null;
  }

  static removeLayer(img: SAImage, layerID: string): boolean {
    let i = 0;
    for (const layer of img.getLayers()) {
      if (layer.id === layerID) {
        break;
      }
      i++;
    }

    if (i === img.getLayers().length)
      return false;

    img.getLayers().splice(i, 1);

    return true;
  }

  static addLayer(img: SAImage, layerPresets?: Layer[], layerID?: string): Layer {
    if (!CImageUtil.hasLayer(img)) {
      img.setLayers([new Layer(layerID ? layerID : '1')]);
      return img.getLayers()[0];
    }

    layerID = layerID ? layerID : this.getNewLayerName(img);

    let color = this.getColor(layerID);
    let size = 1;
    let type = LayerType.Line;

    if (layerPresets) {
      const searchLayer = this.findPreset(layerPresets, layerID);
      if (searchLayer) {
        color = searchLayer.color;
        size = searchLayer.size;
        type = searchLayer.type;
      }
    }

    const newLayer = new Layer(layerID);
    newLayer.color = color;
    newLayer.size = size;
    newLayer.type = type;
    img.setLayers([...img.getLayers(), newLayer]);
    return img.getLayers()[img.getLayers().length - 1];
  }

  static hasLayer(img: SAImage) {
    return img.getLayers() !== undefined && img.getLayers().length !== 0;
  }

  static findPreset(layers: Layer[], newLayerID: string): Layer {
    for(const layer of layers){
      if(layer.id === newLayerID){
        return layer;
      }
    }
    return null
  }

  static getNewLayerName(image: SAImage) {
    let layerName = image.getLayers().length + 1;

    while (this.findLayer(image, String(layerName))) {
      layerName++;
    }

    return String(layerName);
  }


  private static getColor(id: string) {
    try {
      const c = parseInt(id, 10);
      if (c - 1 > 0 && c - 1 < CImageUtil.colors.length) {
        return CImageUtil.colors[c - 1];
      }
    } catch (e) {
      return "#fff"
    }
  }
}
