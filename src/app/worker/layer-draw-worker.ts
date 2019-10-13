import {ImageService} from "../service/image.service";
import {FilterWorker} from "./filter-worker";
import {FilterData} from "./filter-data";
import {Observable} from "rxjs";
import {flatMap, map} from "rxjs/operators";
import DrawUtil from "../utils/draw-util";
import {Layer} from "../model/layer";
import {connectableObservableDescriptor} from "rxjs/internal/observable/ConnectableObservable";
import {ProcessCallback} from "./processCallback";

export class LayerDrawWorker extends FilterWorker {

  private layerID: string;

  private color: string;
  private size: number;
  private drawPoints: boolean;

  public constructor(parent: FilterWorker, layerID: string, color: string = "", size: number = -1, drawPoints: boolean = false) {
    super(parent);
    this.layerID = layerID;
    this.color = color.length == 0 ? "#ffffff" : color;
    this.size = this.size < 0 ? 1 : size;
    this.drawPoints = drawPoints;
  }

  public doWork(parent: FilterWorker, data?: FilterData): Observable<any> {
    console.log("Call LayerDrawWorker");
    const s = new Observable<Layer>((observer) => {

      let layer: Layer;

      for (let l of data.getImg().layers) {
        if (l.id == this.layerID) {
          layer = l;
          break;
        }
      }

      observer.next(layer);
      observer.complete();

    }).pipe(flatMap(
      layer => DrawUtil.loadBase64AsCanvas(data.getImg().data).pipe(
        flatMap(canvas => {
          return new Observable<FilterData>((observer) => {
            if (layer != null) {
              DrawUtil.drawManyPointLinesOnCanvas(canvas, layer.lines, this.color, this.size, this.drawPoints)
              data.getImg().data = DrawUtil.canvasAsBase64(canvas);
            }

            observer.next(data);
            observer.complete();
          })
        })
      ))
    );

    return this.doChain(s);
  }
}
