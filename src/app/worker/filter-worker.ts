import {Observable} from "rxjs";
import {flatMap, tap} from "rxjs/operators";
import {ImageService} from "../service/image.service";
import {FilterData} from "./filter-data";
import {ProcessCallback} from "./processCallback";

export class FilterWorker {

  private parent: FilterWorker;

  private child: FilterWorker;

  private callback: ProcessCallback;

  public constructor(parent?: FilterWorker) {
    this.registerChildFilter(parent);
  }

  public doWork(parent: FilterWorker, data?: FilterData): Observable<any> {
    const simple = new Observable((observer) => {
      console.log("TEst" + this)
      observer.next("test")
      observer.complete();
    });

    return this.doChain(simple);
  }

  public doChain(ob: Observable<any>): Observable<any> {
    if (this.child == null) {
      if (this.callback != null)
        this.callback.callback();
      return ob.pipe(tap(x => {
        if (this.callback != null)
          this.callback.callback();
      })) ;
    } else {
      return ob.pipe(flatMap(x => {
        return this.child.doWork(this, x);
      }))
    }
  }

  public registerChildFilter(parent: FilterWorker) {
    if (parent != null) {
      this.addParent(parent);
      this.addAsChild(parent);
    }
  }

  public addParent(parent: FilterWorker) {
    this.parent = parent;
  }

  public addAsChild(parent: FilterWorker) {
    parent.child = this;
  }

  public pushCallBack(callback: ProcessCallback) {
    this.callback = callback;

    if (this.child != null)
      this.child.pushCallBack(callback);
  }
}
