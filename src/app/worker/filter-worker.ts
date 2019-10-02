import {Observable} from "rxjs";
import {flatMap} from "rxjs/operators";
import {ImageService} from "../service/image.service";
import {FilterData} from "./filter-data";

export class FilterWorker {

  private parent: FilterWorker;

  private child: FilterWorker;

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
    if (this.child == null)
      return ob;
    else {
      return ob.pipe(flatMap(x => {
        return this.child.doWork(this,x);
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
}
