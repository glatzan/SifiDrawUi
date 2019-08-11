import {Point} from "../model/point";
import {Layer} from "../model/layer";

export default class DrawUtil {

  static drawSingleLineOnCanvas(cx: CanvasRenderingContext2D, p1: Point, p2: Point, color: string = "#fff", size: number = 1, drawPoint: boolean = true) {
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

  static drawLineOnCanvas(cx: CanvasRenderingContext2D, points: Point[], color: string = "#fff", size: number = 1, drawPoint: boolean = false) {
    for (let i = 0; i < points.length; i++) {
      if (i + 1 >= points.length) {
        return;
      }
      this.drawSingleLineOnCanvas(cx, points[i], points[i + 1], color, size, drawPoint);
    }
  }

  static drawLinesOnCanvas(cx: CanvasRenderingContext2D, points: Point[][], color: string = "#fff", size: number = 1, drawPoint: boolean = false) {
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
      this.drawLinesOnCanvas(cx, x.lines,x.color,x.size,drawPoint);
    })
  }
}
