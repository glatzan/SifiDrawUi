import {Component, Input} from '@angular/core';
import {Dataset} from './model/dataset';
import {ImportDialogComponent} from './components/import-dialog/import-dialog.component';
import {MatDialog} from '@angular/material';
import {ExportDialogComponent} from './components/export-dialog/export-dialog.component';
import {FilterWorker} from './worker/filter-worker';
import {FilterService} from './service/filter.service';
import {ImageLoadWorker} from './worker/image-load-worker';
import {FilterData} from './worker/filter-data';
import {concatMap, delay, flatMap, map, mergeMap, switchMap, tap} from 'rxjs/operators';
import {ImageService} from './service/image.service';
import {ImageMagicService} from './service/image-magic.service';
import {from, observable, Observable, of, pipe} from 'rxjs';
import {pipeFromArray} from 'rxjs/internal/util/pipe';
import {DatasetService} from './service/dataset.service';
import {Layer} from './model/layer';
import DrawUtil from './utils/draw-util';
import {CImage} from './model/cimage';
import {PNG} from 'pngjs';
import {FlaskService} from './service/flask.service';
import {ImageJService} from './service/image-j.service';
import {PointLine} from './model/point-line';
import {Point} from './model/point';
import {CPolygon} from './utils/cpolygon';
import {SplineUtil} from './utils/spline-util';
import VectorUtils from './utils/vector-utils';
import {DrawCanvasComponent} from './components/draw-canvas/draw-canvas.component';
import {PointLineUtil} from "./utils/point-line-util";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'SifiDrawUi';

  private selectedDatasetId: string;
  private selectedImageId: string;

  @Input() drawCanvasComponent: DrawCanvasComponent;

  constructor(public dialog: MatDialog,
              private filterService: FilterService,
              private imageService: ImageService,
              private imageMagicService: ImageMagicService,
              private datasetSerive: DatasetService,
              private falskService: FlaskService,
              private imageJService: ImageJService) {
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
    // , 'aW1nczIvMjEzMjg=', 'aW1nczIvMjE1NDU=', 'aW1nczIvMjE2NTk=', 'aW1nczIvMjE4Mjk=', 'aW1nczIvMjE4Nzk='
    let datasetID = ['aW1nczIvMjEwNTI='];
//

    // let datasetMapping = [{dataset: atob("imgs2/21052"), mapping: 'tut123'}];

    let me = this;
    // from(datasetID).pipe(concatMap(
    //   x => this.datasetSerive.getDataset(x).pipe(
    //     mergeMap(dataset =>
    //       from(dataset.images).pipe(
    //         me.load(),
    //         this.color("#000000"),
    //         this.layer("2", "#ffffff", 3, false),
    //         this.layer("3", "#ffffff", 3, false),
    //         this.layer("4", "#ffffff", 3, false),
    //         me.classPrepare(),
    //         me.save(datasetMapping,"_mask"),
    //       )
    //     )
    //   )
    // )).subscribe(x => console.log("test"));

    // from(datasetID).pipe(concatMap(
    //   x => this.datasetSerive.getDataset(x).pipe(
    //     mergeMap(dataset =>
    //       from(dataset.images).pipe(
    //         me.load(),
    //         me.save(datasetMapping),
    //       )
    //     )
    //   )
    // )).subscribe(x => console.log("test"));

    // from(datasetID).pipe(concatMap(
    //   x => this.datasetSerive.getDataset(x).pipe(
    //     mergeMap(dataset =>
    //       from(dataset.images).pipe(
    //         me.load(),
    //         me.flask("unetg1")
    //       )
    //     )
    //   )
    // )).subscribe(x => console.log("test"));

    // from(['dG1wL2VzZA==']).pipe(concatMap(
    //   x => this.datasetSerive.getDataset(x).pipe(
    //     mergeMap(dataset =>
    //       from(dataset.images).pipe(
    //         me.load(),
    //         me.flask("unetg1"),
    //         me.save([{dataset: atob("tmp/esd"), mapping: 'was'}], "_mask"),
    //       )
    //     )
    //   )
    // )).subscribe(x => console.log("test"));

    // from(['dG1wL2VzZHc=']).pipe(concatMap(
    //   x => this.datasetSerive.getDataset(x).pipe(
    //     mergeMap(dataset =>
    //       from(dataset.images).pipe(
    //         me.load(),
    //         me.color('#000000', 0, 400),
    //         me.line(),
    //         me.drawLine('#CD0000'),
    //         me.spline(),
    //         me.save([{dataset: atob('tmp/export'), mapping: 'export'}], '_mask')
    //       )
    //     )
    //   )
    // )).subscribe(x => console.log('test'));

    const a = new PointLine();
    a.add(10, 10);
    a.add(100, 100);

    const b = new PointLine();
    b.add(200, 10);
    b.add(150, 100);

    const c = new PointLine();
    c.add(200, 200);
    c.add(200, 300);

    console.log(this.drawCanvasComponent);
  }
}


