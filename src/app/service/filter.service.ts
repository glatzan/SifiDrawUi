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
import {concatMap, finalize, flatMap, ignoreElements, map, mergeMap, tap} from "rxjs/operators";
import {ProcessCallback} from "../worker/processCallback";
import {FilterData} from "../worker/filter-data";
import {DisplayImageWorker} from "../worker/display-image-worker";
import {MagicWorker} from "../worker/magic-worker";
import {DisplayCallback} from "../worker/display-callback";
import {BWClassPrepareWorker} from "../worker/b-w-class-prepare-worker";
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
import CImageUtil from "../utils/cimage-util";
import {DatasetService} from "./dataset.service";
import {isNumber} from "util";

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor(private imageMagicService: ImageMagicService, private datasetService: DatasetService, private imageService: ImageService, private imageJService: ImageJService, private flaskService: FlaskService,) {
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

  public runFilterOnDatasetID(datasets: string[], func: string, env: { processCallback?: ProcessCallback, displayCallback?: DisplayCallback }) {

    const tFrom = from;
    const tConcatMap = concatMap;
    const tMergeMap = mergeMap;
    const obs = Observable
    const im = CImage
    const m = this;
    const display = env.displayCallback;
    const process = env.processCallback;

    //   if (display) {
    //     process.maxRunCount = results.length * 2;
    //     process.completedRunCount = 0;
    //     process.percentRun = 0;
    //   }
    //
    //
    // }
    //
    // catch(e) {
    //   if (e instanceof SyntaxError) {
    //     alert(e);
    //   }
    //   console.error(e);
    //   if (env.processCallback)
    //     env.processCallback.exportIsRunning = false;


    const exe = "tFrom(datasets).pipe(tConcatMap(" +
      "x => this.datasetService.getDataset(x).pipe(" +
      "tMergeMap(dataset =>" +
      "tFrom(dataset.images).pipe(" +
      "tMergeMap(image =>" +
      "new obs((observer) => { observer.next(image); observer.complete()}).pipe(" +
      func +
      ")" +
      ",10)" +
      ")" +
      ")" +
      ")" +
      ")).subscribe(x => console.log('test'));"

    eval(exe)
    // tFrom(datasets).pipe(tConcatMap(
    //   x => this.datasetService.getDataset(x).pipe(
    //     tMergeMap(dataset =>
    //       tFrom(dataset.images).pipe(
    //         tMergeMap(image =>
    //           new Observable<CImage>((observer) => { observer.next(image); observer.complete()}).pipe(
    //             m.load(),
    //             m.save('tmp', [{dataset : '*', mapping : 'ttt'}], false, false, '')
    //           )
    //         ,10)
    //       )
    //     )
    //   )
    // )).subscribe(x => console.log('test'));

    // console.log(exe);
  }

  public runFilterOnDataset(dataset: Dataset, func: string, env: { processCallback?: ProcessCallback, displayCallback?: DisplayCallback }) {
    // let datasetMapping = [{dataset: atob("imgs2/21052"), mapping: 'tut123'}];

    let test;

    let f = "";

    const t = from

    const display = env.displayCallback

    f = "t(dataset.images).pipe(" + func + ").subscribe(x => console.log(\"test\"));";

    let m = this;

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
          data.pushIMG(datasets[y].images[i]);
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

  public load() {
    return flatMap((data: CImage) => this.imageService.getImage(data.id).pipe(map(cimg => {
      console.log(`Load img ${atob(cimg.id)}`);
      let data = new FilterData();
      data.setImg(cimg);
      data.origName = atob(cimg.id);

      console.log(`Data ${data.imgStack.length}`)

      return data;
    })));
  }

  public color(color: string, x = 0, y = 0, height: number = -1, width: number = -1) {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(data.getImg().data).pipe(
      map(canvas => {
        console.log(`Color img ${color}`);

        height = height < 0 ? canvas.height - y : height;
        width = width < 0 ? canvas.width - x : width;

        DrawUtil.drawRect(canvas, x, y, width, height, color);
        data.getImg().data = DrawUtil.canvasAsBase64(canvas);

        return data;
      })));
  }

  public getLines() {
    return flatMap((data: FilterData) =>
      this.imageJService.getLines(data.getImg()).pipe(
        map(json => {
            console.log(`Get Lines`);
            let map = new Map<string, PointLine>();

            for (let res of json) {
              let tmp = map.get(res['Contour ID']);
              const entry = new Point(Math.round(res['X']), Math.round(res['Y']), res['Pos.']);
              if (!tmp) {
                tmp = map.set(res['Contour ID'], new PointLine(res['Contour ID'])).get(res['Contour ID']);
              }
              tmp.addPoint(entry);
            }

            data.additionalData = Array.from(map.values());
            return data;
          }
        )
      )
    );
  }

  public sortLines() {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
      if (data.additionalData != null && data.additionalData.length > 1) {
        console.log("Sort lines");
        const distancePointContainer = PointLineUtil.orderLines(data.additionalData);
        data.additionalData = distancePointContainer.getLines();
      }
      observer.next(data);
      observer.complete();
    }));
  }

  public reducePoints(modulo: number = 10) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
      if (data.additionalData != null) {
        console.log("Reduce Points");
        for (let i = 0; i < data.additionalData.length; i++) {
          const p = new PointLine();
          p.addPoint(data.additionalData[i].getFirstPoint());

          for (let y = 1; y < data.additionalData[i].points.length; y = y + modulo) {
            if (p.getLastPoint().x != data.additionalData[i].points[y].x) {
              p.addPoint(data.additionalData[i].points[y])
            }
          }

          if (p.getLastPoint().x != data.additionalData[i].getLastPoint().x) {
            p.addPoint(data.additionalData[i].getLastPoint())
          }

          data.additionalData[i] = p;
        }
      }
      observer.next(data);
      observer.complete();
    }));
  }

  public drawLine(color: string = "", size: number = 1) {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(data.getImg().data).pipe(map(canvas => {
        if (data.additionalData != null) {
          console.log('Draw Lines');
          let i = 0;
          for (let a of data.additionalData) {
            DrawUtil.drawPointLinesOnCanvas(canvas, a.points, color == "" ? CImageUtil.colors[i + 1] : color, size, false);
            DrawUtil.drawPoint(canvas, a.points[0], "red");
            DrawUtil.drawPoint(canvas, a.points[a.points.length - 1], "blue");
            i++;
          }
          data.getImg().data = DrawUtil.canvasAsBase64(canvas);
        }
        return data;
      }))
    );
  }

  public toGrayscale(){
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
        let buff = new Buffer(data.getImg().data, 'base64');
        let png = PNG.sync.read(buff);
        let buffer = PNG.sync.write(png, {colorType: 0});
        data.getImg().data = buffer.toString('base64');
        observer.next(data);
        observer.complete();
      }
    ));
  }

  public prepareClasses(color: boolean = false) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {

        let buff = new Buffer(data.getImg().data, 'base64');
        let png = PNG.sync.read(buff);

        for (let y = 0; y < png.height; y++) {
          for (let x = 0; x < png.width; x++) {
            let idx = (png.width * y + x) << 2;

            if (!color) {
              if (png.data[idx] > 0) {
                png.data[idx] = 255;
                png.data[idx + 1] = 255;
                png.data[idx + 2] = 255;
              }
            } else {
              if (png.data[idx] > 200) {
                png.data[idx] = 255;
                png.data[idx + 1] = 0;
                png.data[idx + 2] = 0;
              } else if (png.data[idx + 1] > 200) {
                png.data[idx] = 0;
                png.data[idx + 1] = 255;
                png.data[idx + 2] = 0;
              } else if (png.data[idx + 2] > 200) {
                png.data[idx] = 0;
                png.data[idx + 1] = 0;
                png.data[idx + 2] = 255;
              } else {
                png.data[idx] = 255;
                png.data[idx + 1] = 255;
                png.data[idx + 2] = 255;
              }
            }
          }
        }

        let buffer = PNG.sync.write(png, {colorType: 0});
        data.getImg().data = buffer.toString('base64');
        observer.next(data);
        observer.complete();
      }
    ));
  }

  public checkXProgression(color: string) {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(data.getImg().data).pipe(map(canvas => {
      if (data.additionalData != null) {
        console.log("X Progression");

        let lastX = 0;
        for (let i = 0; i < data.additionalData.length; i++) {
          for (let y = 0; y < data.additionalData[i].points; y++) {

            if (lastX < data.additionalData[i].points[y].x) {
              console.error("Double Point");
            }

            DrawUtil.drawPoint(canvas, data.additionalData[i].points[y], color, 2);
          }
        }
        return data;
      }
    })));
  }

  public layer(layerID: string, color: string, size: number, drawPoints: boolean) {
    return flatMap((data: FilterData) => new Observable<Layer>((observer) => {
        let layer = null;
        for (let tmp of data.getImg().layers) {
          if (tmp.id == layerID) {
            layer = tmp;
            break;
          }
        }
        observer.next(layer);
        observer.complete();
      }).pipe(flatMap(layer => DrawUtil.loadBase64AsCanvas(data.getImg().data).pipe(map(canvas => {
        if (layer != null) {
          DrawUtil.drawManyPointLinesOnCanvas(canvas, layer.lines, color, size, drawPoints);
          data.getImg().data = DrawUtil.canvasAsBase64(canvas);
          console.log('layer img' + data.origName + ' ' + layer.id + ' ' + color);
        }
        return data;
      }))))
    );
  }

  public flask(endpoint: string) {
    return flatMap((data: FilterData) => this.flaskService.processImage(data.getImg(), endpoint).pipe(map(cimg => {
      console.log('Fask img' + atob(cimg.id));
      data.setImg(cimg);
      return data;
    })));
  }

  public magic(command: string) {
    return flatMap((data: FilterData) =>
      this.imageMagicService.performMagic(data.getImg(), command).pipe(
        map(cimg => {
            data.setImg(cimg);
            return data;
          }
        )
      )
    );
  }


  public otherSpline() {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(data.getImg().data).pipe(map(canvas => {
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
            DrawUtil.drawPointLineOnCanvas(canvas, new Point(Math.round(outPoints[i]), Math.round(outPoints[i + 1])), new Point(Math.round(outPoints[i + 2]), Math.round(outPoints[i + 3])), "yellow", 2, false)
          }
          console.log(outPoints)
          data.getImg().data = DrawUtil.canvasAsBase64(canvas);
        }
        return data;
      }))
    );
  }


  public cubicSpline() {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(data.getImg().data).pipe(map(canvas => {
        if (data.additionalData != null) {
          console.log("Cubic spline ")

          console.log(data.additionalData)

          const Spline = require('cubic-spline');

          const xs = [];
          const ys = [];

          const ss = data.additionalData;
          for (let pointline  of data.additionalData) {
            for (let points of pointline.points) {
              xs.push(points.x);
              ys.push(points.y);
            }
          }

          if (xs[0] > xs[xs.length - 1]) {
            xs.reverse()
            ys.reverse()
          }

          const start = xs[0]

          // new a Spline object
          let spline = new Spline(xs, ys);

          const cx = canvas.getContext('2d');
          cx.strokeStyle = "red";
          cx.fillStyle = "red"
          cx.lineWidth = 1;

          for (let i = start; i < 1300; i++) {
            const c = spline.at(i)
            if (!isNaN(c)) {
              cx.fillRect(i, c, 2, 2);
            }
          }

          data.getImg().data = DrawUtil.canvasAsBase64(canvas);
        }
        return data;
      }))
    );
  }

  public spline(tension: number = 0.5, color: string = "#cb0000", size = 1, drawPoints = false) {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(data.getImg().data).pipe(map(canvas => {
        if (data.additionalData != null) {

          const poly = new CPolygon();


          for (let pointlines of data.additionalData) {
            for (let point of pointlines.points) {
              poly.addPoint(Math.round(point.x), Math.round(point.y));
            }
          }

          let bezierPoly = SplineUtil.computeSplineCurve(poly, 0.5, false);

          // draw each bezier segment
          let last = bezierPoly.size - 1;
          for (let i = 0; i < last; i += 3) {
            DrawUtil.drawSpline(canvas, bezierPoly.x[i], bezierPoly.y[i], bezierPoly.x[i + 1], bezierPoly.y[i + 1], bezierPoly.x[i + 2], bezierPoly.y[i + 2], bezierPoly.x[i + 3], bezierPoly.y[i + 3], color, size, drawPoints);
          }

          data.getImg().data = DrawUtil.canvasAsBase64(canvas);
        }
        console.log('Draw data');
        return data;
      }))
    );
  }

  public save(targetProject: string, datasetMapping: [{ dataset: string, mapping: string }], addDatasetAsPrefix: boolean = false, copyLayer: boolean = false, imageSuffix?: string) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {

      let oldID = data.origName.split('/');

      let newName = targetProject.replace('/', '') + '/';

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

      if (addDatasetAsPrefix)
        newName += oldDataset.replace("/", "-") + "-";

      newName += oldID[oldID.length - 1];


      if (imageSuffix) {
        newName += imageSuffix;
      }

      const newImg = Object.assign(new CImage(), data.getImg());
      newImg.id = btoa(newName);

      data.pushIMG(newImg);

      if (!copyLayer)
        newImg.layers = data.getImg().layers;

      observer.next(data);
      observer.complete();
    }).pipe(flatMap(data => this.imageService.createImage(data.getImg(), 'png').pipe(
      map(newImg => {
        return data
      }))
    )));
  }

  public display(displayCallback: DisplayCallback, img: number = -1) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
      console.log(`Display img ${img} of ${data.imgStack.length}`);
      if (displayCallback != null) {
        if (img != -1)
          displayCallback.displayCallBack(data.getImg(img));
        else
          displayCallback.displayCallBack(data.getImg());
      }
      observer.next(data);
      observer.complete();
    }));
  }

  public overlay() {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {

        if (arguments.length >= 2 && data.imgStack.length >= 2) {

          console.log("Overlay");

          if (!isNumber(arguments[0]) && arguments[0] > 0 && arguments[0] < data.imgStack.length)
            observer.error();

          const buff = new Buffer(data.getImg(arguments[0]).data, 'base64');
          const png = PNG.sync.read(buff);

          console.log(atob(data.getImg(arguments[0]).data))

          for (let i = 1; i < arguments.length; i++) {

            if (!isNumber(arguments[i]) && arguments[i] > 0 && arguments[i] < data.imgStack.length)
              observer.error(`Wrong argument ${arguments[i]}`);

            console.log(atob(data.getImg(arguments[i]).data))

            const buff2 = new Buffer(data.getImg(arguments[i]).data, 'base64');
            const png2 = PNG.sync.read(buff2);

           // if (png.width != png2.width || png.height != png2.height){
           //   observer.error(`Image does not match ${png.width} - ${png2.width} / ${png.height} - ${png2.height}`);
           // }

            for (let y = 0; y < png.height; y++) {
              for (let x = 0; x < png.width; x++) {
                let idx = (png.width * y + x) << 2;

               // console.log(`${png2.data[idx]} - ${png2.data[idx+1]} - ${png2.data[idx+2]}`)
                if (png2.data[idx] > 0 || png2.data[idx + 1] > 0 || png2.data[idx + 2] > 0) {
                  png.data[idx] = png2.data[idx];
                  png.data[idx + 1] = png2.data[idx + 1];
                  png.data[idx + 2] = png2.data[idx + 2];
                }
              }
            }
          }

          let buffer = PNG.sync.write(png, {colorType: 0});
          this.pushImg();
          data.getImg().data = buffer.toString('base64');

          observer.next(data);
          observer.complete();
          console.log("overlay end")
        } else {
          observer.error();
        }
        observer.next(data);
        observer.complete();
      }
    ));
  }

  public showProgress(progressCallback) {

  }

  public pushImg(index ?: number) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
      console.log(`Pushing IMG Index ${index} to ${data.imgStack.length}`);

      const imToCopy = index != undefined ? data.getImg(index) : data.getImg();
      const copy = Object.assign(new CImage(), imToCopy);
      copy.layers = imToCopy.layers;

      data.pushIMG(copy);

      console.log(data.imgStack.length);

      observer.next(data);
      observer.complete();
    }));
  }

  public popImg() {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
      console.log(`Poping IMG ${data.imgStack.length - 1}`);
      data.popIMG();
      observer.next(data);
      observer.complete();
    }));
  }
}
