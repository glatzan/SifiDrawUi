import {Component} from '@angular/core';
import {Dataset} from './model/dataset';
import {ImportDialogComponent} from "./components/import-dialog/import-dialog.component";
import {MatDialog} from "@angular/material";
import {ExportDialogComponent} from "./components/export-dialog/export-dialog.component";
import {FilterWorker} from "./worker/filter-worker";
import {FilterService} from "./service/filter.service";
import {ImageLoadWorker} from "./worker/image-load-worker";
import {FilterData} from "./worker/filter-data";
import {flatMap, map, mergeMap, switchMap, tap} from "rxjs/operators";
import {ImageService} from "./service/image.service";
import {concatMap} from "rxjs-compat/operator/concatMap";
import {ImageMagicService} from "./service/image-magic.service";
import {from, Observable, of, pipe} from "rxjs";
import {pipeFromArray} from "rxjs/internal/util/pipe";
import {DatasetService} from "./service/dataset.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'SifiDrawUi';

  private selectedDatasetId: string;
  private selectedImageId: string;

  constructor(public dialog: MatDialog, private filterService: FilterService, private imageService: ImageService, private imageMagicService: ImageMagicService, private datasetSerive: DatasetService) {
  }

  onDatasetSelect(id: string) {
    console.log(id);
    this.selectedDatasetId = id;
  }

  onImageSelect(id: string) {
    console.log(`Select Image ${id}`);
    this.selectedImageId = id;
  }

  openImportDialog(): void {
    const dialogRef = this.dialog.open(ImportDialogComponent, {
      height: '768px',
      width: '1024px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }


  openExportDialog(id?: string): void {
    const dialogRef = this.dialog.open(ExportDialogComponent, {
      height: '768px',
      width: '1024px',
      data: {id}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  public joinTest() {

    let w = new ImageLoadWorker(null, this.imageService);

    let datasetID = ['aW1nczIvMjEwNTI=', 'aW1nczIvMjEzMjg=', 'aW1nczIvMjE1NDU=', 'aW1nczIvMjE4Mjk=', 'aW1nczIvMjE4Nzk=']

    let datasetMapping = [{dataset: atob("imgs2/21052"), mapping: 'tut123'}];
    // of('aW1nczIvMjEwNTIvMA==', 'aW1nczIvMjEwNTIvMQ==', 'aW1nczIvMjEwNTIvMg==', 'aW1nczIvMjEwNTIvMw==').pipe(
    this.datasetSerive.getDatasets(datasetID).pipe(
      mergeMap(datasets =>
          from(datasets).pipe(
            mergeMap(datas =>
                from(datas.images).pipe(
                  flatMap(x => this.imageService.getImage(x.id)),
                  map(cimg => {
                    let data = new FilterData();
                    data.origImage = cimg;
                    data.origName = atob(data.origImage.id)
                    return data
                  }),
                  flatMap(data =>
                    this.imageMagicService.performMagic(data.origImage, "-threshold 20% -define connected-components:area-threshold=5 -define connected-components:mean-color=true -connected-components 8").pipe(
                      map(cimg => {
                          data.origImage = cimg;
                          return data;
                        }
                      )
                    )
                  ),
                  map(data => {

                    let oldID = data.origName.split("/");

                    const targetProject = "newProject".replace("/", "") + "/";

                    let newName = targetProject;

                    // searching for dataset mapping
                    let oldDataset = "";
                    let newDataset;

                    for (let i = 1; i < oldID.length - 1; i++) {
                      oldDataset += oldID[i] + "/"
                    }

                    oldDataset = oldDataset.slice(0, -1);

                    if (datasetMapping.length == 1)
                      newDataset = datasetMapping[0].mapping;
                    else {
                      for (let i = 0; i < datasetMapping.length; i++) {
                        if (oldDataset === datasetMapping[i].dataset) {
                          newDataset = datasetMapping[i].mapping;
                          break;
                        }
                      }
                    }

                    newName += newDataset + "/";

                    newName += oldDataset.replace("/", "-") + "-";

                    newName += oldID[oldID.length - 1];
                    console.log(newName)
                    data.origImage.id = btoa(newName);
                    return data
                  }),
                  flatMap(data => {
                    console.log("save" + data.origImage.id)
                    console.log(atob(data.origImage.id))
                    return this.imageService.createImage(data.origImage, 'png')
                  })
                )
              , 10)
          )
        , 1)
    ).subscribe(x => console.log("test"));
  }
}

