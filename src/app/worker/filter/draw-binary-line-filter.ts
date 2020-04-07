import {AbstractFilter, Services} from "./abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {FilterHelper} from "./filter-helper";
import {Point} from "../../model/point";
import {ColorType, PNG} from "pngjs";

export class DrawBinaryLineFilter extends AbstractFilter {

  image: PNG;
  color: { r: number, g: number, b: number, a: number };

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, layerIDs: [string], rgba: { r: number, g: number, b: number, a: number }, targetPos: number = sourcePos, colorType: ColorType = 6) {
    return map((data: FilterData) => {

        const [source, target] = this.getSourceAndTarget(data, sourcePos, targetPos);


        if (!target)
          throw new Error(`DrawLayerFilter: TargetImage not found index ${targetPos}!`);

        this.image = FilterHelper.imageToPNG(target);
        this.color = rgba;

        source.layers.forEach(layer => {
          const result = layerIDs.filter(x => x == layer.id);

          if (result.length) {
            for (let line of layer.lines) {
              for (let i = 1; i < line.length; i++) {
                this.drawLine(line[i-1], line[i])
              }
            }
          }
        });

        FilterHelper.pngToImage(this.image, target, colorType);
        return data;
      }
    );
  }

  drawLine(p0: Point, p1: Point) {
    if (Math.abs(p1.y - p0.y) < Math.abs(p1.x - p0.x)) {
      if (p0.x > p1.x) {
        this.drawLineLow(p1.x, p1.y, p0.x, p0.y)
      } else {
        this.drawLineLow(p0.x, p0.y, p1.x, p1.y)
      }
    } else {
      if (p0.y > p1.y) {
        this.drawLineHigh(p1.x, p1.y, p0.x, p0.y)
      } else {
        this.drawLineHigh(p0.x, p0.y, p1.x, p1.y)
      }
    }
  }

  drawLineLow(x0: number, y0: number, x1: number, y1: number) {
    let dx = x1 - x0;
    let dy = y1 - y0;
    let yi = 1;
    if (dy < 0) {
      yi = -1;
      dy = -dy
    }
    let D = 2 * dy - dx;
    let y = y0;

    for (let x = x0; x <= x1; x++) {
      this.plot(x, y);
      if (D > 0) {
        y = y + yi;
        D = D - 2 * dx
      }
      D = D + 2 * dy
    }
  }

  drawLineHigh(x0: number, y0: number, x1: number, y1: number) {
    let dx = x1 - x0;
    let dy = y1 - y0;
    let xi = 1;
    if (dx < 0) {
      xi = -1;
      dx = -dx
    }

    let D = 2 * dx - dy;
    let x = x0;

    for (let y = y0; x <= y1; y++) {
      this.plot(x, y);
      if (D > 0) {
        x = x + xi;
        D = D - 2 * dy
      }
      D = D + 2 * dx
    }
  }

  plot(x, y) {
    const idx = (this.image.width * y + x) << 2;
    this.image.data[idx] = this.color.r;
    this.image.data[idx + 1] = this.color.g;
    this.image.data[idx + 2] = this.color.b;
    this.image.data[idx + 3] = this.color.a;
  }
}

