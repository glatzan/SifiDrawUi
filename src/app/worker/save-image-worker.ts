import {FilterWorker} from "./filter-worker";
import {ImageService} from "../service/image.service";
import {FilterData} from "./filter-data";
import {Observable} from "rxjs";
import {flatMap} from "rxjs/operators";
import DrawUtil from "../utils/draw-util";

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

    console.log("--------")
    console.log(this.project)
  }

  public doWork(parent: FilterWorker, data?: FilterData): Observable<FilterData> {
    console.log("Call SaveImageWorker");

    const s = new Observable<FilterData>((observer) => {

      if (!this.copyLayer)
        data.origImage.layers = [];

      if (data.origImage.id == null || data.origImage.id.length == 0)
        observer.error("ID not set");

      const id = atob(data.origImage.id);

      const index = id.lastIndexOf("/");

      if (index == -1)
        observer.error("ID not valid");

      const name = id.substring(index + 1);

      data.origImage.id = this.project.replace("/", "") + "/" + this.dataset.replace("/", "") + "/" + name;

      observer.next(data);
      observer.complete();
    }).pipe(flatMap(data => this.imageService.createImage(data.origImage, this.type)));

    return this.doChain(s);
  }
}
