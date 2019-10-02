import {FilterWorker} from "./filter-worker";
import {ImageService} from "../service/image.service";
import {FilterData} from "./filter-data";
import {Observable} from "rxjs";
import {flatMap} from "rxjs/operators";
import DrawUtil from "../utils/draw-util";
import {DisplayCallback} from "./display-callback";

export class DisplayImageWorker extends FilterWorker {

  private displayCallback: DisplayCallback;

  public constructor(parent: FilterWorker, displayCallback: DisplayCallback) {
    super(parent);
    this.displayCallback = displayCallback;
  }

  public doWork(parent: FilterWorker, data?: FilterData): Observable<FilterData> {
    console.log("Call DisplayImageWorker");

    const s = new Observable<FilterData>((observer) => {
      console.log(this.displayCallback)
      if (this.displayCallback != null)
        this.displayCallback.displayCallBack(data.origImage);
      observer.next(data);
      observer.complete();
    })

    return this.doChain(s);
  }
}
