import {FilterWorker} from "./filter-worker";
import {ImageService} from "../service/image.service";
import {FilterData} from "./filter-data";
import {Observable} from "rxjs";
import {flatMap} from "rxjs/operators";

export class DatasetLoadWorker extends FilterWorker {

  private data: ImageService;

  public constructor(parent: FilterWorker, imageService: ImageService) {
    super(parent);
    // this.imageService = imageService;
  }

  public doWork(parent: FilterWorker, data: FilterData): Observable<FilterData> {
    // const requestArr = [];
    //
    // for (let datasetID of this.datasetIDs) {
    //   requestArr.push(this.datasetService.getDataset(datasetID));
    // }
    //
    // forkJoin(requestArr).console.log("Call ImageLoadWorker");

    return null;
  }
}
