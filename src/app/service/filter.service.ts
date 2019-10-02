import {Injectable} from '@angular/core';
import {ImageMagicFilter} from "../filter/image-magic-filter";
import {ImageFilter} from "../filter/image-filter";
import {ImageMagicService} from "./image-magic.service";
import {Filter} from "../filter/filter";
import {CImage} from "../model/cimage";
import {ImageEventFilter} from "../filter/image-event-filter";
import {ImageService} from "./image.service";
import {OrigImageWorker} from "../worker/orig-image-worker";
import {FilterWorker} from "../worker/filter-worker";
import {ColorImageWorker} from "../worker/color-image-worker";
import {LayerDrawWorker} from "../worker/layer-draw-worker";
import {SaveImageWorker} from "../worker/save-image-worker";
import {Dataset} from "../model/dataset";
import {forkJoin, Observable} from "rxjs";

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


  public origImageWorker(imageID: string, parent?: FilterWorker) {
    return new OrigImageWorker(parent, imageID, this.imageService);
  }

  public colorImageWorker(parent: FilterWorker, color: string = "#000000", x: number = -1, y: number = -1, width: number = -1, height: number = -1) {
    return new ColorImageWorker(parent, x, y, width, height, color);
  }

  public layerDrawWorker(parent: FilterWorker, layerID: string, color: string = "", size: number = -1, drawPoints: boolean = false) {
    return new LayerDrawWorker(parent, layerID, color, size, drawPoints);
  }

  public saveImageWorker(parent: FilterWorker, project: string, dataset: string, copyLayer: boolean = false) {
    return new SaveImageWorker(parent, this.imageService, project, dataset, copyLayer);
  }

  public runWorkers(imgs: { src: Dataset[], target: string[] }, filterChain: string, env: { targetProject: string }, callback) {
    try {

      console.log("rung" + imgs.target.length)

      if (imgs.src.length !== imgs.target.length) {
        console.log("Error");
        return;
      }

      const f = this
      const projectDir = env.targetProject;

      const results = [];

      for (let y = 0; y < imgs.src.length; y++) {
        for (let i = 0; i < imgs.src[y].images.length; i++) {
          const img = imgs.src[y].images[i].id;
          const datasetDir = imgs.target[y];

          let start;

          eval(filterChain);

          if (start == undefined) {
            console.log("Fehler start nicht defined");
            return;
          }


          results.push(start.doWork(undefined))
        }
      }

      forkJoin(results).subscribe(x => {
        callback.exportIsRunning = false;
        console.log("Ende");
      });
    } catch (e) {
      if (e instanceof SyntaxError) {
        alert(e);
      }
      console.error(e)
      callback.exportIsRunning = false;
    }
  }
}
