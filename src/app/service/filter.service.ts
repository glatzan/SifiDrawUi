import {Injectable} from '@angular/core';
import {ImageMagicFilter} from "../filter/image-magic-filter";
import {ImageFilter} from "../filter/image-filter";
import {ImageMagicService} from "./image-magic.service";
import {Filter} from "../filter/filter";
import {CImage} from "../model/cimage";
import {ImageEventFilter} from "../filter/image-event-filter";
import {ImageService} from "./image.service";
import {ImageLoadWorker} from "../worker/image-load-worker";
import {FilterWorker} from "../worker/filter-worker";
import {ColorImageWorker} from "../worker/color-image-worker";
import {LayerDrawWorker} from "../worker/layer-draw-worker";
import {SaveImageWorker} from "../worker/save-image-worker";
import {Dataset} from "../model/dataset";
import {defer, forkJoin, merge, Observable, of, Subject} from "rxjs";
import {finalize, flatMap, ignoreElements, map, mergeMap, tap} from "rxjs/operators";
import {ProcessCallback} from "../worker/processCallback";
import {FilterData} from "../worker/filter-data";
import {DisplayImageWorker} from "../worker/display-image-worker";
import {MagicWorker} from "../worker/magic-worker";
import {DisplayCallback} from "../worker/display-callback";
import {BWClassPrepareWorker} from "../worker/b-w-class-prepare-worker";

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor(private imageMagicService: ImageMagicService, private imageService: ImageService) {
  }

  public getAllFilters(): Filter[] {
    return new Array<Filter>();
  }

  public getNewMagicFilter(command: string, parentFilter?: ImageFilter) {
    const m = new ImageMagicFilter(parentFilter || undefined, command);
    m.imageMagicService = this.imageMagicService;
    return m;
  }

  public getNewEventFilter(callBack: (image: CImage) => any, bind: any, origImage: CImage, parentFilter: ImageFilter) {
    return new ImageEventFilter(parentFilter || undefined, callBack.bind(bind), origImage)
  }

  public

  public imageLoadWorker(parent?: FilterWorker): ImageLoadWorker {
    return new ImageLoadWorker(parent, this.imageService);
  }

  public colorImageWorker(parent: FilterWorker, color: string = "#000000", x: number = -1, y: number = -1, width: number = -1, height: number = -1): ColorImageWorker {
    return new ColorImageWorker(parent, x, y, width, height, color);
  }

  public layerDrawWorker(parent: FilterWorker, layerID: string, color: string = "", size: number = -1, drawPoints: boolean = false): LayerDrawWorker {
    return new LayerDrawWorker(parent, layerID, color, size, drawPoints);
  }

  public saveImageWorker(parent: FilterWorker, project: string, datasetMapping: [{ dataset: string, mapping: string }], addDatasetAsPrefix: boolean = false, copyLayer: boolean = false, imageSuffix?: string): SaveImageWorker {
    return new SaveImageWorker(parent, this.imageService, project, datasetMapping, addDatasetAsPrefix, copyLayer, imageSuffix);
  }

  public displayImageWorker(parent: FilterWorker, displayCallback: DisplayCallback): DisplayImageWorker {
    return new DisplayImageWorker(parent, displayCallback);
  }

  public magicWorker(parent: FilterWorker, command: string): MagicWorker {
    return new MagicWorker(parent, command, this.imageMagicService);
  }

  public bwClassPrepareWorker(parent: FilterWorker): BWClassPrepareWorker {
    return new BWClassPrepareWorker(parent);
  }

  public runWorkers(datasets: Dataset[], filterChain: string, env: { processCallback?: ProcessCallback, displayCallback?: DisplayCallback }) {
    try {

      const f = this;
      const display = env.displayCallback;
      const results = [];

      let count = 0;

      for (let y = 0; y < datasets.length; y++) {
        for (let i = 0; i < datasets[y].images.length; i++) {
          const data = new FilterData();
          data.origImage = datasets[y].images[i];
          data.origName = atob(datasets[y].images[i].id);

          data.numberInBatch = count;

          let start;

          eval(filterChain);

          if (start == undefined) {
            console.log("Fehler start nicht defined");
            return;
          }

          start.pushCallBack(env.processCallback);
          results.push(start.doWork(undefined, data))
          count++;
        }
      }

      if (env.processCallback) {
        env.processCallback.maxRunCount = results.length * 2;
        env.processCallback.completedRunCount = 0;
        env.processCallback.percentRun = 0;
      }

      forkJoin(results).subscribe(x => {
        if (env.processCallback)
          env.processCallback.exportIsRunning = false;
        console.log("Ende");
      });

    } catch (e) {
      if (e instanceof SyntaxError) {
        alert(e);
      }
      console.error(e);
      if (env.processCallback)
        env.processCallback.exportIsRunning = false;
    }
  }


}


function forkJoinWithProgress(arrayOfObservables) {

  return defer(() => { // here we go

    let counter = 0;
    const percent$ = new Subject();

    const modilefiedObservablesList = arrayOfObservables.map(
      (item, index) => item.pipe(
        tap(() => {
          const percentValue = ++counter * 100 / arrayOfObservables.length;
          percent$.next(percentValue);
        })
      )
    );

    const finalResult$ = forkJoin(modilefiedObservablesList).pipe(
      tap(() => {
        percent$.next(100);
        percent$.complete();
      })
    );

    return of([finalResult$, percent$.asObservable()]);
  })

}
