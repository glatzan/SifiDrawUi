import {Point} from '../model/point';
import {Layer} from '../model/layer';
import {CImage} from '../model/cimage';
import {Observable, fromEvent} from 'rxjs';
import {promise} from "selenium-webdriver";

export default class DrawUtil {

  static drawSingleLineOnCanvas(cx: CanvasRenderingContext2D, p1: Point, p2: Point, color: string = '#fff', size: number = 1, drawPoint: boolean = true) {
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

  static drawLineOnCanvas(cx: CanvasRenderingContext2D, points: Point[], color: string = '#fff', size: number = 1, drawPoint: boolean = false) {
    for (let i = 0; i < points.length; i++) {
      if (i + 1 >= points.length) {
        return;
      }
      this.drawSingleLineOnCanvas(cx, points[i], points[i + 1], color, size, drawPoint);
    }
  }

  static drawLinesOnCanvas(cx: CanvasRenderingContext2D, points: Point[][], color: string = '#fff', size: number = 1, drawPoint: boolean = false) {
    points.forEach(x => DrawUtil.drawLineOnCanvas(cx, x, color, size, drawPoint));
  }

  static drawCircle(cx: CanvasRenderingContext2D, pos: Point, radius: number) {
    cx.beginPath();
    cx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    cx.stroke();
  }

  static clearRect(cx: CanvasRenderingContext2D, width: number, height: number, point_: Point = {x: 0, y: 0}) {
    cx.clearRect(point_.x, point_.y, width, height);
  }

  static redrawCanvas(cx: CanvasRenderingContext2D, layers: Layer[], size: number = 1, drawPoint: boolean = true) {
    layers.forEach(x => {
      this.drawLinesOnCanvas(cx, x.lines, x.color, x.size, drawPoint);
    });
  }

  static async drawCanvas(canvas: HTMLCanvasElement, image: CImage, drawImage: boolean, background: string, useLayerSettings: boolean, layers: Layer[]) {
    const img = await DrawUtil.loadImage(image.data)

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
