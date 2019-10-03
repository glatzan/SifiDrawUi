import {FilterWorker} from "./filter-worker";
import {FilterData} from "./filter-data";
import {Observable} from "rxjs";
import {ImageService} from "../service/image.service";
import {flatMap} from "rxjs/operators";
import {ProcessCallback} from "./processCallback";

export class OrigImageWorker extends FilterWorker {

  private imageService: ImageService;

  private imageID: string;

  public constructor(parent: FilterWorker, imageID: string, imageService: ImageService) {
    super(parent);
    this.imageID = imageID;
    this.imageService = imageService;
  }

  public doWork(parent: FilterWorker, data: FilterData): Observable<FilterData> {
    console.log("Call OrigImageWorker");
    const s = this.imageService.getImage(this.imageID).pipe(flatMap(image => {
      return new Observable<FilterData>((observer) => {
        data.origImage = image;
        observer.next(data);
        observer.complete();
      })
    }));

    return this.doChain(s);
  }
}
