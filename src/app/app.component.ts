import {Component} from '@angular/core';
import {Dataset} from './model/dataset';
import {ImportDialogComponent} from "./components/import-dialog/import-dialog.component";
import {MatDialog} from "@angular/material";
import {ExportDialogComponent} from "./components/export-dialog/export-dialog.component";
import {FilterWorker} from "./worker/filter-worker";
import {FilterService} from "./service/filter.service";
import {ImageLoadWorker} from "./worker/image-load-worker";
import {FilterData} from "./worker/filter-data";
import {concatMap, delay, flatMap, map, mergeMap, switchMap, tap} from "rxjs/operators";
import {ImageService} from "./service/image.service";
import {ImageMagicService} from "./service/image-magic.service";
import {from, observable, Observable, of, pipe} from "rxjs";
import {pipeFromArray} from "rxjs/internal/util/pipe";
import {DatasetService} from "./service/dataset.service";
import {Layer} from "./model/layer";
import DrawUtil from "./utils/draw-util";
import {CImage} from "./model/cimage";
import {PNG} from "pngjs";
import {FlaskService} from "./service/flask.service";
import {ImageJService} from "./service/image-j.service";
import {PointLine} from "./model/point-line";
import {Point} from "./model/point";
import {CPolygon} from "./utils/cpolygon";
import {SplineUtil} from "./utils/spline-util";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'SifiDrawUi';

  private selectedDatasetId: string;
  private selectedImageId: string;

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
    let datasetID = ['aW1nczIvMjEwNTI=']
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

    from(['dG1wL2VzZHc=']).pipe(concatMap(
      x => this.datasetSerive.getDataset(x).pipe(
        mergeMap(dataset =>
          from(dataset.images).pipe(
            me.load(),
            me.color("#000000", 0, 400),
            me.line(),
            me.drawLine("#CD0000"),
            me.spline(),
            me.save([{dataset: atob("tmp/export"), mapping: 'export'}], "_mask")
          )
        )
      )
    )).subscribe(x => console.log("test"));

  }

  public end() {

  }

  public flask(endpoint: string) {
    return flatMap((data: FilterData) => this.falskService.processImage(data.origImage, "unetg1").pipe(map(cimg => {
      let data = new FilterData();
      data.origImage = cimg;
      console.log("load img" + data.origName)
      return data
    })));
  }

  public classPrepare() {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {

      let buff = new Buffer(data.origImage.data, 'base64');
      let png = PNG.sync.read(buff);

      for (let y = 0; y < png.height; y++) {
        for (let x = 0; x < png.width; x++) {
          let idx = (png.width * y + x) << 2;

          if (png.data[idx] > 0) {
            // invert color
            png.data[idx] = 255;
            png.data[idx + 1] = 255;
            png.data[idx + 2] = 255;
          }
          // and reduce opacity
          //png.data[idx + 3] = png.data[idx + 3] >> 1;
        }
      }

      let buffer = PNG.sync.write(png, {colorType: 0});
      data.origImage.data = buffer.toString('base64');

      observer.next(data);
      observer.complete();
    }));
  }

  public color(color: string, x = 0, y = 0, height: number = -1, width: number = -1) {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(data.origImage.data).pipe(
      map(canvas => {
        height = height < 0 ? canvas.height - y : height;
        width = width < 0 ? canvas.width - x : width;

        DrawUtil.drawRect(canvas, x, y, width, height, color);
        data.origImage.data = DrawUtil.canvasAsBase64(canvas);

        console.log("color img" + data.origName + " " + color)
        return data
      })));
  }


  public load() {
    return flatMap((data: CImage) => this.imageService.getImage(data.id).pipe(map(cimg => {
      let data = new FilterData();
      data.origImage = cimg;
      data.origName = atob(data.origImage.id)
      console.log("load img" + data.origName)
      return data
    })));
  }

  public layer(layerID: string, color: string, size: number, drawPoints: boolean) {
    return flatMap((data: FilterData) => new Observable<Layer>((observer) => {
        let layer = null;
        for (let tmp of data.origImage.layers) {
          if (tmp.id == layerID) {
            layer = tmp;
            break;
          }
        }
        observer.next(layer);
        observer.complete();
      }).pipe(flatMap(layer => DrawUtil.loadBase64AsCanvas(data.origImage.data).pipe(map(canvas => {
        if (layer != null) {
          DrawUtil.drawManyPointLinesOnCanvas(canvas, layer.lines, color, size, drawPoints)
          data.origImage.data = DrawUtil.canvasAsBase64(canvas);
          console.log("layer img" + data.origName + " " + layer.id + " " + color)
        }
        return data;
      }))))
    )
  }

  public magic() {
    return flatMap((data: FilterData) =>
      this.imageMagicService.performMagic(data.origImage, "-threshold 20% -define connected-components:area-threshold=5 -define connected-components:mean-color=true -connected-components 8").pipe(
        map(cimg => {
            data.origImage = cimg;
            return data;
          }
        )
      )
    )
  }

  public line() {
    return flatMap((data: FilterData) =>
      this.imageJService.getLines(data.origImage).pipe(
        map(json => {

            let map = new Map<string, PointLine>();

            for (let res of json) {
              let tmp = map.get(res['Contour ID']);
              const entry = new Point(res['X'], res['Y'], res['Pos.']);
              if (!tmp) {
                tmp = map.set(res['Contour ID'], new PointLine(res['Contour ID'])).get(res['Contour ID']);
              }

              tmp.addPoint(entry)
            }

            const result = Array.from(map.values());
            data.additionalData = result

            console.log(result)
            return data;
          }
        )
      )
    )
  }

  public drawLine(color: string, size: number = 1) {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(data.origImage.data).pipe(map(canvas => {
        if (data.additionalData != null) {
          console.log("add data found")
          for (let a of data.additionalData) {
            console.log(a)
            DrawUtil.drawPointLinesOnCanvas(canvas, a.points, color, size, false)
          }
          data.origImage.data = DrawUtil.canvasAsBase64(canvas);
        }
        console.log("Draw data")
        return data;
      }))
    )
  }

  public spline() {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(data.origImage.data).pipe(map(canvas => {
        if (data.additionalData != null) {

          const poly = new CPolygon();

          const rest = [];


          let a = 0;
          for (let pointlines of data.additionalData) {
            console.log("-----")
            console.log(pointlines)
            for (let point of pointlines.points) {

              // if (a % 10 == 0)
                poly.addPoint(point.x, point.y);

              a += 1;
            }
          }

          function RandomSplinePoly() {
            const poly = new CPolygon();
            for (let i = 0; i < 6; i++) {
              poly.addPoint(Math.floor(Math.random() * 1300), Math.floor(Math.random() * 650));
            }
            return poly;
          }

          console.log(poly)

          let bezierPoly = SplineUtil.computeSplineCurve(RandomSplinePoly(), 0.5, false);

          // draw each bezier segment
          let last = bezierPoly.size - 1;
          for (let i = 0; i < last; i += 3) {
            DrawUtil.drawSpline(canvas, bezierPoly.x[i], bezierPoly.y[i], bezierPoly.x[i + 1], bezierPoly.y[i + 1], bezierPoly.x[i + 2], bezierPoly.y[i + 2], bezierPoly.x[i + 3], bezierPoly.y[i + 3], "#000000")
          }

          bezierPoly = SplineUtil.computeSplineCurve(poly, 0.0, false);

          // draw each bezier segment
          last = bezierPoly.size - 1;
          for (let i = 0; i < last; i += 3) {
            DrawUtil.drawSpline(canvas, bezierPoly.x[i], bezierPoly.y[i], bezierPoly.x[i + 1], bezierPoly.y[i + 1], bezierPoly.x[i + 2], bezierPoly.y[i + 2], bezierPoly.x[i + 3], bezierPoly.y[i + 3], "#cbcd00")
          }

          data.origImage.data = DrawUtil.canvasAsBase64(canvas);
        }
        console.log("Draw data")
        return data;
      }))
    )
  }

  public save(datasetMapping, imageSuffix?: string) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {

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

      if (imageSuffix)
        newName += imageSuffix;

      data.origImage.id = btoa(newName);

      observer.next(data);
      observer.complete();
    }).pipe(flatMap(data => this.imageService.createImage(data.origImage, 'png'))))
  }
}


