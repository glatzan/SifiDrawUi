import {Point} from '../model/point';
import {Layer} from '../model/layer';
import {CImage} from '../model/CImage';
import {Observable} from 'rxjs';
import {flatMap} from "rxjs/operators";
import {LayerType} from "../model/layer-type.enum";

export default class DrawUtil {

  /**
   * Creates a new canvas Element
   * @param height
   * @param width
   */
  static createCanvas(height: number, width: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.height = height;
    canvas.width = width;
    return canvas;
  }

  /**
   * Loads a rest image to an Image Element
   * @param src
   */
  static loadImageAsObservable(src): Observable<HTMLImageElement> {
    return new Observable<HTMLImageElement>((observer) => {
      let img = new Image();
      img.onload = () => {
        observer.next(img);
        observer.complete();
      };
      img.onerror = () => {
        observer.error();
      };
      img.src = 'data:image/png;base64,' + src;
    });
  }

  /**
   * Creates a canvas and draws an image into it
   * @param img
   */
  static loadImageAsCanvas(img: HTMLImageElement, canvas?: HTMLCanvasElement): HTMLCanvasElement {
    if (!canvas)
      canvas = DrawUtil.createCanvas(img.naturalHeight, img.naturalWidth);
    canvas.getContext('2d').drawImage(img, 0, 0);
    return canvas;
  }

  static loadBase64AsCanvas(base: string, canvas?: HTMLCanvasElement): Observable<HTMLCanvasElement> {
    return DrawUtil.loadImageAsObservable(base).pipe(flatMap(x => {
      return new Observable<HTMLCanvasElement>((observer) => {
        const c = DrawUtil.loadImageAsCanvas(x, canvas);
        observer.next(c);
        observer.complete();
      })
    }));
  }

  /**
   * Returns the content of a canvas as base64.
   * @param canvas
   */
  static canvasAsBase64(canvas): string {
    const result = canvas.toDataURL()
    return result.substr(result.indexOf(',') + 1);
  }

  /**
   * Draws a line between two points
   * @param canvas
   * @param p1
   * @param p2
   * @param color
   * @param size
   * @param drawPoint
   */
  static drawPointLineOnCanvas(canvas: HTMLCanvasElement, p1: Point, p2: Point, color: string = '#fff', size: number = 1, drawPoint: boolean = true) {
    const cx = canvas.getContext('2d');
    cx.strokeStyle = color;
    cx.lineWidth = size;
    cx.beginPath();
    cx.moveTo(p1.x, p1.y); // from
    cx.lineTo(p2.x, p2.y);
    cx.stroke();
    if (drawPoint) {
      cx.fillRect(p1.x, p1.y, 2, 2);
      cx.fillRect(p2.x, p2.y, 2, 2);
    }
  }

  static drawSpline(canvas: HTMLCanvasElement, startX: number, startY: number, e1X: number, e1Y: number, e2X: number, e2Y: number, endX: number, endY: number, color: string = '#fff', size: number = 1, drawPoint: boolean = true) {
    const cx = canvas.getContext('2d');
    cx.strokeStyle = color;
    cx.lineWidth = size;
    cx.fillStyle = color;
    cx.beginPath();
    cx.moveTo(startX, startY); // from
    cx.bezierCurveTo(e1X, e1Y, e2X, e2Y, endX, endY);
    cx.stroke();

    if (drawPoint) {
      cx.fillStyle = "green";
      cx.fillRect(startX, startY, 4, 4);
      cx.fillRect(endX, endY, 4, 4);
      cx.fillStyle = "red";
      cx.fillRect(e1X, e1Y, 4, 4);
      cx.fillRect(e2X, endY, 4, 4);
    }
  }

  /**
   * Draws lines between points
   * @param canvas
   * @param points
   * @param color
   * @param size
   * @param drawPoint
   */
  static drawPointLinesOnCanvas(canvas: HTMLCanvasElement, points: Point[], color: string = '#fff', size: number = 1, drawPoint: boolean = false) {
    for (let i = 0; i < points.length; i++) {
      if (i + 1 >= points.length) {
        return;
      }
      this.drawPointLineOnCanvas(canvas, points[i], points[i + 1], color, size, drawPoint);
    }
  }

  /**
   * @deprecated
   * @param canvas
   * @param points
   * @param color
   * @param size
   */
  static drawPoint(canvas: HTMLCanvasElement, points: Point, color: string = '#fff', size: number = 2,) {
    const cx = canvas.getContext('2d');
    cx.fillStyle = color;
    cx.fillRect(points.x, points.y, size, size);
  }

  /**
   * Draws a text on the canvas
   * @param canvas
   * @param text
   * @param position
   * @param style
   */
  static text(canvas: HTMLCanvasElement, text: string, position: Point, style: string = "20px Arial", fontColor: string = "#ff0000") {
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = fontColor;
    ctx.font = style;
    ctx.fillText(text, position.x, position.y);
  }

  /**
   * Draws several lines
   * @param canvas
   * @param points
   * @param color
   * @param size
   * @param drawPoint
   */
  static drawManyPointLinesOnCanvas(canvas: HTMLCanvasElement, points: Point[][], color: string = '#fff', size: number = 1, drawPoint: boolean = false) {
    points.forEach(x => DrawUtil.drawPointLinesOnCanvas(canvas, x, color, size, drawPoint));
  }


  static drawLinesOnCanvas(cx: CanvasRenderingContext2D, points: Point[][], color: string = '#fff', size: number = 1, drawPoint: boolean = false, closed = false) {
    points.forEach(x => DrawUtil.drawLineOnCanvas(cx, x, color, size, drawPoint, closed));
  }

  static drawLineOnCanvas(cx: CanvasRenderingContext2D, points: Point[], color: string = '#fff', size: number = 1, drawPoint: boolean = false, closed = false) {
    for (let i = 0; i < points.length - 1; i++) {
      this.drawTwoPointLineOnCanvas(cx, points[i], points[i + 1], color, size);
    }

    if (closed) {
      this.drawTwoPointLineOnCanvas(cx, points[points.length - 1], points[0], color, size);
    }

    if (drawPoint)
      this.drawPointsOnCanvas(cx, points, color, size)
  }

  static drawTwoPointLineOnCanvas(cx: CanvasRenderingContext2D, p1: Point, p2: Point, color: string = '#fff', size: number = 1) {
    cx.strokeStyle = color;
    cx.lineWidth = size;
    cx.beginPath();
    cx.moveTo(p1.x, p1.y); // from
    cx.lineTo(p2.x, p2.y);
    cx.stroke();
  }


  static drawPointsOnCanvas(cx: CanvasRenderingContext2D, points: Point[], color: string = '#fff', size: number = 1) {
    cx.fillStyle = color
    points.forEach(point => {
      cx.fillRect(point.x, point.y, size, size);
      cx.fillRect(point.x, point.y, size, size);
    })
  }

  static drawPointOnCanvas(cx: CanvasRenderingContext2D, point: Point, color: string = '#fff', size: number = 1) {
    cx.fillStyle = color
    cx.fillRect(point.x, point.y, size, size);
    cx.fillRect(point.x, point.y, size, size);
  }

  static drawCircle(cx: CanvasRenderingContext2D, pos: Point, radius: number) {
    cx.beginPath();
    cx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    cx.stroke();
  }

  static clearRect(cx: CanvasRenderingContext2D, width: number, height: number, point_: Point = {x: 0, y: 0, pos: 0}) {
    cx.clearRect(point_.x, point_.y, width, height);
  }

  static drawRect(cx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) {
    cx.beginPath();
    cx.rect(x, y, width, height);
    cx.fillStyle = color;
    cx.fill();
  }


  static redrawCanvas(cx: CanvasRenderingContext2D, layers: Layer[], drawPoint: boolean = true) {
    layers.forEach(x => {
      this.drawLayer(cx, x, drawPoint);
    });
  }

  static drawLayer(cx: CanvasRenderingContext2D, layer: Layer, drawPoint: boolean = true) {
    switch (layer.type) {
      case LayerType.Dot:
        layer.lines.forEach(points => {
          this.drawPointsOnCanvas(cx, points, layer.color, layer.size)
        });
        break;
      case LayerType.Line:
        this.drawLinesOnCanvas(cx, layer.lines, layer.color, layer.size, drawPoint);
        break;
      case LayerType.Polygon:
        this.drawLinesOnCanvas(cx, layer.lines, layer.color, layer.size, drawPoint, true);
        break;
      case LayerType.FilledPolygon:
        break;
    }
  }

  static async drawCanvas(canvas: HTMLCanvasElement, image: CImage, drawImage: boolean, background: string, useLayerSettings: boolean, layers: Layer[]) {
    const img = await DrawUtil.loadImage(image.data);

    const width = img.width;
    const height = img.height;

    canvas.width = width;
    canvas.height = height;

    const cx = canvas.getContext('2d');

    if (background) {
      cx.fillRect(0, 0, width, height);
    }

    if (drawImage) {
      cx.drawImage(img, 0, 0);
    }

    layers.forEach(x => {
      image.layers.forEach(y => {
        if (x.id == y.id) {
          this.drawLinesOnCanvas(cx, y.lines, useLayerSettings ? y.color : x.color, useLayerSettings ? y.size : x.size, false);
        }
      });
    });
  }

  static loadImage(src): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      let img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = 'data:image/png;base64,' + src;
    })
  }

  static imgToBase64(src, callback) {
    const canvas = document.createElement('canvas');
    const cx = canvas.getContext('2d');
    canvas.height = src.naturalHeight;
    canvas.width = src.naturalWidth;
    cx.drawImage(src, 0, 0);
    const result = canvas.toDataURL()
    callback(result.substr(result.indexOf(',') + 1));
  }

  static loadImageToCanvas(src, callback) {
    DrawUtil.loadImageFromBase64(src, x => {
      const canvas = document.createElement('canvas');
      const cx = canvas.getContext('2d');
      canvas.height = x.naturalHeight;
      canvas.width = x.naturalWidth;
      cx.drawImage(x, 0, 0);
      callback(canvas)
    })
  }

  static loadImageFromBase64(src, callback) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
      callback(img)
    }
    img.src = 'data:image/png;base64,' + src;
  }
}
