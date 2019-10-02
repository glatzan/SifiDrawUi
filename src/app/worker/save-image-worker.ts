import {FilterWorker} from "./filter-worker";
import {ImageService} from "../service/image.service";
import {FilterData} from "./filter-data";
import {Observable} from "rxjs";
import {flatMap} from "rxjs/operators";
import DrawUtil from "../utils/draw-util";
import {ProcessCallback} from "./processCallback";

export class SaveImageWorker extends FilterWorker {

  private imageService: ImageService;

  private project: string;

  private dataset: string;

  private copyLayer: boolean;

  private type: string = "png";

  public constructor(parent: FilterWorker, imageService: ImageService, project: string, dataset: string, copyLayer: boolean) {
    super(parent);
    this.imageService = imageService;
    this.project = project;
    this.dataset = dataset;
    this.copyLayer = copyLayer;
  }

  public doWork(parent: FilterWorker, data?: FilterData): Observable<FilterData> {
    console.log("Call SaveImageWorker");

    const s = new Observable<FilterData>((observer) => {

      if (!this.copyLayer)
        data.origImage.layers = [];

      if (data.origImage.id == null || data.origImage.id.length == 0)
        observer.error("ID not set");

      let imageName = "";

      if (data.targetName != null) {
        imageName = data.targetName;
      } else {
        const id = atob(data.origImage.id).split("/");

        if (id.length >= 1)
          observer.error("ID not valid");

        imageName = id[id.length - 1];
      }

      data.origImage.id = btoa(this.project.replace("/", "") + "/" + this.dataset.replace("/", "") + "/" + imageName);

      observer.next(data);
      observer.complete();
    }).pipe(flatMap(data => this.imageService.createImage(data.origImage, this.type)));

    return this.doChain(s);
  }
}
