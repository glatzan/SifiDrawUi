import {FilterWorker} from "./filter-worker";
import {ImageService} from "../service/image.service";
import {FilterData} from "./filter-data";
import {Observable} from "rxjs";
import {flatMap} from "rxjs/operators";
import DrawUtil from "../utils/draw-util";
import {ProcessCallback} from "./processCallback";

export class SaveImageWorker extends FilterWorker {

  private imageService: ImageService;

  private copyLayer: boolean;

  private type: string = "png";

  private targetProject: string;

  private imageSuffix: string;

  private addDatasetAsPrefix: boolean;

  private datasetMapping: [{ dataset: string, mapping: string }];

  public constructor(parent: FilterWorker, imageService: ImageService, targetProject: string, datasetMapping: [{ dataset: string, mapping: string }], addDatasetAsPrefix: boolean = false, copyLayer: boolean = false, imageSuffix?: string) {
    super(parent);
    this.imageService = imageService;
    this.copyLayer = copyLayer;
    this.targetProject = targetProject;
    this.datasetMapping = datasetMapping;
    this.imageSuffix = imageSuffix;
    this.addDatasetAsPrefix = addDatasetAsPrefix;
  }

  public doWork(parent: FilterWorker, data?: FilterData): Observable<FilterData> {
    console.log("Call SaveImageWorker");

    const s = new Observable<FilterData>((observer) => {

      if (!this.copyLayer)
        data.origImage.layers = [];

      if (data.origName == null || data.origName.length == 0)
        observer.error("ID not set");

      let oldID = data.origName.split("/");

      if (!oldID || oldID.length < 3)
        observer.error("ID Error");

      const targetProject = this.targetProject.replace("/", "") + "/";

      let newName = targetProject;

      // searching for dataset mapping
      let oldDataset = "";
      let newDataset;

      for (let i = 1; i < oldID.length - 1; i++) {
        oldDataset += oldID[i] + "/"
      }

      oldDataset = oldDataset.slice(0, -1);

      if (this.datasetMapping.length == 1)
        newDataset = this.datasetMapping[0].mapping;
      else {
        for (let i = 0; i < this.datasetMapping.length; i++) {
          if (oldDataset === this.datasetMapping[i].dataset) {
            newDataset = this.datasetMapping[i].mapping;
            break;
          }
        }
      }

      if (!newDataset)
        observer.error("No Dataset-Mapping found");

      newName += newDataset + "/";

      if (this.addDatasetAsPrefix)
        newName += oldDataset.replace("/", "-") + "-";

      newName += oldID[oldID.length - 1];

      if (this.imageSuffix)
        newName += this.imageSuffix;

      data.origImage.id = btoa(newName);

      observer.next(data);
      observer.complete();
    }).pipe(flatMap(data => this.imageService.createImage(data.origImage, this.type)));

    return this.doChain(s);
  }
}
