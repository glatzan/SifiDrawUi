import {FilterWorker} from "./filter-worker";
import {ImageService} from "../service/image.service";
import {FilterData} from "./filter-data";
import {Observable} from "rxjs";
import {flatMap} from "rxjs/operators";
import {ImageMagicService} from "../service/image-magic.service";
import DrawUtil from "../utils/draw-util";

export class MagicWorker extends FilterWorker {

  private imageMagicService: ImageMagicService;

  private command: string;

  public constructor(parent: FilterWorker, command: string, imageMagicService: ImageMagicService) {
    super(parent);
    this.imageMagicService = imageMagicService;
    this.command = command;
  }

  public doWork(parent: FilterWorker, data: FilterData): Observable<FilterData> {
    console.log("Call MagicWorker");
    const s = this.imageMagicService.performMagic(data.origImage, this.command).pipe(flatMap(img => {
      return new Observable<FilterData>((observer) => {
        data.origImage = img;
        data.data = "";
        observer.next(data);
        observer.complete();
      })
    }));

    return this.doChain(s);
  }
}
