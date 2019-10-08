import {Injectable} from '@angular/core';
import {ImageMagicFilter} from "../filter/image-magic-filter";
import {ImageFilter} from "../filter/image-filter";
import {ImageMagicService} from "./image-magic.service";
import {Filter} from "../filter/filter";
import {CImage} from "../model/cimage";
import {ImageEventFilter} from "../filter/image-event-filter";
import {ImageService} from "./image.service";
import {ImageLoadWorker} from "../worker/image-load-worker";
import {FilterWorker} from "../worker/filter-worker";
import {ColorImageWorker} from "../worker/color-image-worker";
import {LayerDrawWorker} from "../worker/layer-draw-worker";
import {SaveImageWorker} from "../worker/save-image-worker";
import {Dataset} from "../model/dataset";
import {defer, forkJoin, from, merge, Observable, of, Subject} from "rxjs";
import {finalize, flatMap, ignoreElements, map, mergeMap, tap} from "rxjs/operators";
import {ProcessCallback} from "../worker/processCallback";
import {FilterData} from "../worker/filter-data";
import {DisplayImageWorker} from "../worker/display-image-worker";
import {MagicWorker} from "../worker/magic-worker";
import {DisplayCallback} from "../worker/display-callback";
import {BWClassPrepareWorker} from "../worker/b-w-class-prepare-worker";
import {concatMap} from "rxjs-compat/operator/concatMap";
import {PNG} from "pngjs";
import DrawUtil from "../utils/draw-util";
import {Layer} from "../model/layer";
import {PointLine} from "../model/point-line";
import {Point} from "../model/point";
import {CPolygon} from "../utils/cpolygon";
import {SplineUtil} from "../utils/spline-util";
import {PointLineUtil} from "../utils/point-line-util";
import {ImageJService} from "./image-j.service";
import {FlaskService} from "./flask.service";

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor(private imageMagicService: ImageMagicService, private imageService: ImageService, private imageJService: ImageJService, private flaskService: FlaskService,) {
  }

  public getAllFilters(): Filter[] {
    return new Array<Filter>();
  }

  public getNewMagicFilter(command: string, parentFilter?: ImageFilter) {
    const m = new ImageMagicFilter(parentFilter || undefined, command);
    m.imageMagicService = this.imageMagicService;
    return m;
  }

  public getNewEventFilter(callBack: (image: CImage) => any, bind: any, origImage: CImage, parentFilter: ImageFilter) {
    return new ImageEventFilter(parentFilter || undefined, callBack.bind(bind), origImage)
  }

  public

  public imageLoadWorker(parent?: FilterWorker): ImageLoadWorker {
    return new ImageLoadWorker(parent, this.imageService);
  }

  public colorImageWorker(parent: FilterWorker, color: string = "#000000", x: number = -1, y: number = -1, width: number = -1, height: number = -1): ColorImageWorker {
    return new ColorImageWorker(parent, x, y, width, height, color);
  }

  public layerDrawWorker(parent: FilterWorker, layerID: string, color: string = "", size: number = -1, drawPoints: boolean = false): LayerDrawWorker {
    return new LayerDrawWorker(parent, layerID, color, size, drawPoints);
  }

  public saveImageWorker(parent: FilterWorker, project: string, datasetMapping: [{ dataset: string, mapping: string }], addDatasetAsPrefix: boolean = false, copyLayer: boolean = false, imageSuffix?: string): SaveImageWorker {
    return new SaveImageWorker(parent, this.imageService, project, datasetMapping, addDatasetAsPrefix, copyLayer, imageSuffix);
  }

  public displayImageWorker(parent: FilterWorker, displayCallback: DisplayCallback): DisplayImageWorker {
    return new DisplayImageWorker(parent, displayCallback);
  }

  public magicWorker(parent: FilterWorker, command: string): MagicWorker {
    return new MagicWorker(parent, command, this.imageMagicService);
  }

  public bwClassPrepareWorker(parent: FilterWorker): BWClassPrepareWorker {
    return new BWClassPrepareWorker(parent);
  }

  public runFilterOnDataset(dataset: Dataset, func: string, env: { processCallback?: ProcessCallback, displayCallback?: DisplayCallback }) {
    // let datasetMapping = [{dataset: atob("imgs2/21052"), mapping: 'tut123'}];

    let test;

    let f = "";

    const t = from

    const display = env.displayCallback

    f = "t(dataset.images).pipe(" + func + ").subscribe(x => console.log(\"test\"));";

    let m = this;

    console.log(f)

    eval(f)

    // console.log(dataset.images)
    // from(dataset.images).pipe(
    //  test
    // ).subscribe(x => console.log("test"));

    // m.load(),
    //   m.color("#000000"),
    //   m.display(display)
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


    // m.load(),
    // m.line(),
    // m.color("#000000"),
    // m.drawLine("#ffffff"),
    // m.sortLines(),
    // m.display(display)
  }

  public runWorkers(datasets: Dataset[], filterChain: string, env: { processCallback?: ProcessCallback, displayCallback?: DisplayCallback }) {
    try {

      const f = this;
      const display = env.displayCallback;
      const results = [];

      let count = 0;

      for (let y = 0; y < datasets.length; y++) {
        for (let i = 0; i < datasets[y].images.length; i++) {
          const data = new FilterData();
          data.origImage = datasets[y].images[i];
          data.origName = atob(datasets[y].images[i].id);

          data.numberInBatch = count;

          let start;

          eval(filterChain);

          if (start == undefined) {
            console.log("Fehler start nicht defined");
            return;
          }

          start.pushCallBack(env.processCallback);
          results.push(start.doWork(undefined, data))
          count++;
        }
      }

      if (env.processCallback) {
        env.processCallback.maxRunCount = results.length * 2;
        env.processCallback.completedRunCount = 0;
        env.processCallback.percentRun = 0;
      }

      forkJoin(results).subscribe(x => {
        if (env.processCallback)
          env.processCallback.exportIsRunning = false;
        console.log("Ende");
      });

    } catch (e) {
      if (e instanceof SyntaxError) {
        alert(e);
      }
      console.error(e);
      if (env.processCallback)
        env.processCallback.exportIsRunning = false;
    }
  }

  public flask(endpoint: string) {
    return flatMap((data: FilterData) => this.flaskService.processImage(data.origImage, 'unetg1').pipe(map(cimg => {
      let data = new FilterData();
      data.origImage = cimg;
      console.log('load img' + data.origName);
      return data;
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

        console.log('color img' + data.origName + ' ' + color);
        return data;
      })));
  }


  public load() {
    return flatMap((data: CImage) => this.imageService.getImage(data.id).pipe(map(cimg => {
      let data = new FilterData();
      data.origImage = cimg;
      data.origName = atob(data.origImage.id);
      console.log('load img' + data.origName);
      return data;
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
          DrawUtil.drawManyPointLinesOnCanvas(canvas, layer.lines, color, size, drawPoints);
          data.origImage.data = DrawUtil.canvasAsBase64(canvas);
          console.log('layer img' + data.origName + ' ' + layer.id + ' ' + color);
        }
        return data;
      }))))
    );
  }

  public magic() {
    return flatMap((data: FilterData) =>
      this.imageMagicService.performMagic(data.origImage, '-threshold 20% -define connected-components:area-threshold=5 -define connected-components:mean-color=true -connected-components 8').pipe(
        map(cimg => {
            data.origImage = cimg;
            return data;
          }
        )
      )
    );
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

              tmp.addPoint(entry);
            }

            const result = Array.from(map.values());
            data.additionalData = result;

            console.log(result);
            return data;
          }
        )
      )
    );
  }

  public drawLine(color: string, size: number = 1) {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(data.origImage.data).pipe(map(canvas => {
        if (data.additionalData != null) {
          console.log('add data found');
          for (let a of data.additionalData) {
            console.log(a);
            DrawUtil.drawPointLinesOnCanvas(canvas, a.points, color, size, false);
          }
          data.origImage.data = DrawUtil.canvasAsBase64(canvas);
        }
        console.log('Draw data');
        return data;
      }))
    );
  }

  public otherSpline() {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(data.origImage.data).pipe(map(canvas => {
        if (data.additionalData != null) {

          const result = [];

          for (let a  of data.additionalData) {
            for (let p of a.points) {
              result.push(Math.round(p.x));
              result.push(Math.round(p.y));
            }
          }

          let getCurvePoints = require("cardinal-spline-js").getCurvePoints;
          let outPoints = getCurvePoints(result);

          for (let i = 0; i < outPoints.length; i++) {
            if (i + 3 >= outPoints.length)
              break
            DrawUtil.drawPointLineOnCanvas(canvas, new Point(Math.round(outPoints[i]), Math.round(outPoints[i + 1])), new Point(Math.round(outPoints[i + 2]), Math.round(outPoints[i + 3])), "#000000")
          }
          console.log(outPoints)
          data.origImage.data = DrawUtil.canvasAsBase64(canvas);
        }
        console.log('Draw data');
        return data;
      }))
    );
  }

  public cubicSpline() {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(data.origImage.data).pipe(map(canvas => {
        if (data.additionalData != null) {
          console.log("Cubic spline ")

          const Spline = require('cubic-spline');

          const xs = [];
          const ys = [];

          for (let a  of data.additionalData) {
            for (let p of a.points) {
              xs.push(Math.round(p.x));
              ys.push(Math.round(p.y));
            }
          }



          const start = xs[0] > xs[xs.length - 1] ? xs[xs.length - 1] : xs[0]

          console.log(".....")
          console.log(xs)
          console.log(ys)
          // console.log(start)

          // new a Spline object
          let spline = new Spline(xs, ys);

          const cx = canvas.getContext('2d');
          cx.strokeStyle = "red";
          cx.fillStyle = "red"
          cx.lineWidth = 1;

          let notNan = false;

          for (let i = start; i < 1300; i++) {
            const c = spline.at(i)
            console.log(i + " -> " + c)
            //cx.beginPath();
            if (!isNaN(c)) {
              console.log("Draw -> " +c)
              cx.fillRect(i, c, 2, 2);
              notNan = true
            }
          }

          if(!notNan){
            console.log("NAN values revert")
            xs.reverse()
            ys.reverse()
            spline = new Spline(xs, ys);
            for (let i = start; i < 1300; i++) {
              const c = spline.at(i)
              console.log(i + " -> " + c)
              if (!isNaN(c)) {
                cx.fillRect(i, c, 2, 2);
              }
            }
          }
          data.origImage.data = DrawUtil.canvasAsBase64(canvas);
        }
        console.log('Draw data');
        return data;
      }))
    );
  }

  public spline(tension: number = 0.5, color: string = "#cb0000", size = 1, drawPoints = false) {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(data.origImage.data).pipe(map(canvas => {
        if (data.additionalData != null) {

          const poly = new CPolygon();


          for (let pointlines of data.additionalData) {
            for (let point of pointlines.points) {
              poly.addPoint(Math.round(point.x), Math.round(point.y));
            }
          }


          // function RandomSplinePoly() {
          //   const poly = new CPolygon();
          //   for (let i = 0; i < 6; i++) {
          //     poly.addPoint(Math.floor(Math.random() * 1300), Math.floor(Math.random() * 650));
          //   }
          //   return poly;
          // }
          //
          // console.log(poly);
          //
          // let bezierPoly = SplineUtil.computeSplineCurve(RandomSplinePoly(), 0.5, false);
          //
          // // draw each bezier segment
          // let last = bezierPoly.size - 1;
          // for (let i = 0; i < last; i += 3) {
          //   DrawUtil.drawSpline(canvas, bezierPoly.x[i], bezierPoly.y[i], bezierPoly.x[i + 1], bezierPoly.y[i + 1], bezierPoly.x[i + 2], bezierPoly.y[i + 2], bezierPoly.x[i + 3], bezierPoly.y[i + 3], '#000000');
          // }

          let bezierPoly = SplineUtil.computeSplineCurve(poly, 0.5, false);

          // draw each bezier segment
          let last = bezierPoly.size - 1;
          for (let i = 0; i < last; i += 3) {
            DrawUtil.drawSpline(canvas, bezierPoly.x[i], bezierPoly.y[i], bezierPoly.x[i + 1], bezierPoly.y[i + 1], bezierPoly.x[i + 2], bezierPoly.y[i + 2], bezierPoly.x[i + 3], bezierPoly.y[i + 3], color, size, drawPoints);
          }

          data.origImage.data = DrawUtil.canvasAsBase64(canvas);
        }
        console.log('Draw data');
        return data;
      }))
    );
  }


  public sortLines() {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
      if (data.additionalData != null && data.additionalData.length > 1) {
        console.log("---")
        console.log(data.additionalData)
        const distancePointContainer = PointLineUtil.orderLines(data.additionalData);
        data.additionalData = distancePointContainer.getLines();
        console.log(data.additionalData)
        console.log("---")
      }
      observer.next(data);
      observer.complete();
    }));
  }

  public reducePoints() {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
      if (data.additionalData != null) {

        for (let i = 0; i < data.additionalData.length; i++) {
          const p = new PointLine();

          p.addPoint(data.additionalData[i].getFirstPoint());
          for (let y = 1; y < data.additionalData[i].points.length; y = y + 20) {
            p.addPoint(data.additionalData[i].points[y])
          }

          if (data.additionalData[i].points.length % 20 != 0)
            p.addPoint(data.additionalData[i].getLastPoint());

          data.additionalData[i] = p;
        }
      }
      observer.next(data);
      observer.complete();
    }));
  }

  public save(datasetMapping, imageSuffix?: string) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {

      let oldID = data.origName.split('/');

      const targetProject = 'newProject'.replace('/', '') + '/';

      let newName = targetProject;

      // searching for dataset mapping
      let oldDataset = '';
      let newDataset;

      for (let i = 1; i < oldID.length - 1; i++) {
        oldDataset += oldID[i] + '/';
      }

      oldDataset = oldDataset.slice(0, -1);

      if (datasetMapping.length == 1) {
        newDataset = datasetMapping[0].mapping;
      } else {
        for (let i = 0; i < datasetMapping.length; i++) {
          if (oldDataset === datasetMapping[i].dataset) {
            newDataset = datasetMapping[i].mapping;
            break;
          }
        }
      }

      newName += newDataset + '/';

      newName += oldDataset.replace('/', '-') + '-';

      newName += oldID[oldID.length - 1];
      console.log(newName);

      if (imageSuffix) {
        newName += imageSuffix;
      }

      data.origImage.id = btoa(newName);

      observer.next(data);
      observer.complete();
    }).pipe(flatMap(data => this.imageService.createImage(data.origImage, 'png'))));
  }

  public display(displayCallback: DisplayCallback) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
      console.log("Call DisplayImageWorker");
      if (displayCallback != null)
        displayCallback.displayCallBack(data.origImage);
      observer.next(data);
      observer.complete();
    }));
  }
}
