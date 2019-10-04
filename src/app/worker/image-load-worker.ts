import {FilterWorker} from "./filter-worker";
import {FilterData} from "./filter-data";
import {Observable} from "rxjs";
import {ImageService} from "../service/image.service";
import {flatMap} from "rxjs/operators";
import {ProcessCallback} from "./processCallback";

export class ImageLoadWorker extends FilterWorker {

  private imageService: ImageService;

  public constructor(parent: FilterWorker, imageService: ImageService) {
    super(parent);
    this.imageService = imageService;
  }

  public doWork(parent: FilterWorker, data: FilterData): Observable<FilterData> {
    console.log("Call ImageLoadWorker");
    const s = this.imageService.getImage(data.origImage.id).pipe(flatMap(image => {
      return new Observable<FilterData>((observer) => {
        data.origImage = image;
        observer.next(data);
        observer.complete();
      })
    }));

    return this.doChain(s);
  }
}
