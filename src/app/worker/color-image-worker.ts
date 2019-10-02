import {FilterWorker} from "./filter-worker";
import {ImageService} from "../service/image.service";
import {FilterData} from "./filter-data";
import {Observable} from "rxjs";
import {flatMap} from "rxjs/operators";
import DrawUtil from "../utils/draw-util";
import {ProcessCallback} from "./processCallback";

export class ColorImageWorker extends FilterWorker {

  private color: string;

  private x: number;
  private y: number;
  private height: number;
  private width: number;


  constructor(parent: FilterWorker, x: number = -1, y: number = -1, width: number = -1, height: number = -1, color: string = "#000000") {
    super(parent);
    this.color = color;
    this.x = x < 0 ? 0 : x;
    this.y = y < 0 ? 0 : y;
    this.height = height;
    this.width = width;
  }

  public doWork(parent: FilterWorker, data?: FilterData): Observable<FilterData> {
    console.log("Call ColorImageWorker");

    let s;

    if (data == undefined) {

      data = new FilterData();

      s = new Observable<FilterData>((observer) => {
        const canvas = DrawUtil.createCanvas(this.height, this.width);
        DrawUtil.drawRect(canvas, this.x, this.y, this.width, this.height, this.color);
        data.origImage.data = DrawUtil.canvasAsBase64(canvas);
        observer.next(data);
        observer.complete();
      })
    } else {
      s = DrawUtil.loadBase64AsCanvas(data.origImage.data).pipe(flatMap(canvas => {
        return new Observable<FilterData>((observer) => {
          const height = this.height < 0 ? canvas.height : this.height;
          const width = this.width < 0 ? canvas.width : this.width;

          DrawUtil.drawRect(canvas, this.x, this.y, width, height, this.color);
          data.origImage.data = DrawUtil.canvasAsBase64(canvas);
          observer.next(data);
          observer.complete();
        })
      }));
    }

    return this.doChain(s);
  }
}
