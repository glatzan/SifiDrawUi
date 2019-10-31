import {Injectable} from '@angular/core';
import {ImageMagicFilter} from "../filter/image-magic-filter";
import {ImageFilter} from "../filter/image-filter";
import {ImageMagicService} from "./image-magic.service";
import {Filter} from "../filter/filter";
import {CImage} from "../model/cimage";
import {ImageEventFilter} from "../filter/image-event-filter";
import {ImageService} from "./image.service";
import {Dataset} from "../model/dataset";
import {defer, forkJoin, from, merge, Observable, of, Subject} from "rxjs";
import {concatMap, finalize, flatMap, ignoreElements, map, mergeMap, tap} from "rxjs/operators";
import {FilterData} from "../worker/filter-data";
import {ColorType, PNG} from "pngjs";
import DrawUtil from "../utils/draw-util";
import {Layer} from "../model/layer";
import {PointLine} from "../model/point-line";
import {Point} from "../model/point";
import {CPolygon} from "../utils/cpolygon";
import {SplineUtil} from "../utils/spline-util";
import {DistancePointContainer, PointLineUtil} from "../utils/point-line-util";
import {ImageJService} from "./image-j.service";
import {FlaskService} from "./flask.service";
import CImageUtil from "../utils/cimage-util";
import {DatasetService} from "./dataset.service";
import {isNumber} from "util";
import {ProcessCallback} from "../worker/processCallback";
import {DisplayCallback} from "../worker/display-callback";
import {Expression, Equation, parse} from 'algebra.js';
import VectorUtils from "../utils/vector-utils";

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
      data.pushIMG(cimg)
      data.origName = atob(cimg.id);
      return data;
    })));
  }

  public cloneImage(index ?: number) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
      console.log(`Cloning IMG Index ${index} to ${data.imgStack.length}`);

      if (index && index < 0 && index >= data.imgStack.length)
        observer.error(`Clone Image out of bounds ${index}`);

      const imToCopy = index ? data.imgStack[index] : data.img;
      const copy = Object.assign(new CImage(), imToCopy);
      copy.layers = imToCopy.layers;
      data.pushIMG(copy);

      observer.next(data);
      observer.complete();
    }));
  }

  public activeImage(index: number) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
      console.log(`Setting IMG Index ${index} as active`);

      if (index && index < 0 && index >= data.imgStack.length)
        observer.error(`Clone Image out of bounds ${index}`);

      data.img = data.imgStack[index]

      observer.next(data);
      observer.complete();
    }));
  }

  public flask(endpoint: string) {
    return flatMap((data: FilterData) => this.flaskService.processImage(data.img, endpoint).pipe(map(cimg => {
      console.log('Fask img' + atob(cimg.id));

      data.img.data = cimg.data;

      return data;
    })));
  }

  public findCenterLines(targetName: string = "lines") {
    return flatMap((data: FilterData) =>
      this.imageJService.getLines(data.img).pipe(
        map(json => {
            console.log(`Searching for Lines ..`);
            let map = new Map<string, PointLine>();

            for (let res of json) {
              let contour = map.get(res['Contour ID']);

              const point = new Point(Math.round(res['X']), Math.round(res['Y']), res['Pos.']);

              if (!contour) {
                contour = map.set(res['Contour ID'], new PointLine(res['Contour ID'], res['Length'])).get(res['Contour ID']);
              }

              contour.addPoint(point);
            }

            const dis = new DistancePointContainer();
            dis.addLines(Array.from(map.values()), new Array(map.size - 1).fill(0));
            data.setData(dis, targetName);

            return data;
          }
        )
      )
    );
  }

  public sortLines(sourceName: string = "lines", targetName: string = "sortedLines") {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
      const lines = data.getData(sourceName);

      if (lines instanceof DistancePointContainer) {
        if (lines.getLines().length > 1) {
          console.log("Sort lines");
          data.setData(PointLineUtil.orderLines(lines.getLines()), targetName);
        } else {
          console.log("No or only one line found, not sorting");
          data.setData(lines, targetName);
        }

      } else {
        observer.error(`Could not find source ${sourceName}`);
      }

      observer.next(data);
      observer.complete();
    }));
  }

  public prepareHost(joinLinesMaxTo: number = 100, sourceName: string = "sortedLines", targetName: string = "hostLines") {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
      const sortedLines = data.getData(sourceName);

      if (sortedLines instanceof DistancePointContainer && sortedLines.hasLines()) {
        console.log("Preparing Host");

        const container: DistancePointContainer[] = [];
        container.push(new DistancePointContainer(sortedLines.getLine(0)));
        let index = 0;

        for (let i = 1; i < sortedLines.getLines().length; i++) {
          const line = sortedLines.getLine(i);

          console.log(`Length of index ${i - 1} to next ${sortedLines.getDistanceToNextLine(i - 1)}`)
          if (sortedLines.getDistanceToNextLine(i - 1) <= joinLinesMaxTo) {
            container[index].addLine(line, sortedLines.getDistanceToNextLine(i - 1))
            console.log("adding")
          } else {
            console.log(`Total length of line ${container[index].getTotalLength()}`)
            console.log("new")
            container.push(new DistancePointContainer(line));
            index++;
          }
        }

        let result: DistancePointContainer = null;

        for (let o of container) {
          if (!result || result.getTotalLength() < o.getTotalLength())
            result = o;
        }

        data.setData(result, targetName);

      }
      observer.next(data);
      observer.complete();
    }));
  }

//{ eraseMap = [{x : 0, y : 0, width : 0, height : 0}]}
  public prepareGraft(joinLines = 100, sourceName = "sortedLines", targetName = "graftLines") {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
      const sortedLines = data.getData(sourceName);

      if (sortedLines instanceof DistancePointContainer && sortedLines.hasLines()) {
        console.log("Preparing Graft");

        const container: DistancePointContainer[] = [];
        container.push(new DistancePointContainer(sortedLines.getLine(0)));
        let index = 0;

        for (let i = 1; i < sortedLines.getLines().length; i++) {
          const line = sortedLines.getLine(i);

          console.log(`Length of index ${i - 1} to next ${sortedLines.getDistanceToNextLine(i - 1)}`)
          if (sortedLines.getDistanceToNextLine(i - 1) <= joinLines) {
            container[index].addLine(line, sortedLines.getDistanceToNextLine(i - 1))
            console.log("adding")
          } else {
            console.log(`Total length of line ${container[index].getTotalLength()}`)
            console.log("new")
            sortedLines.setDistanceToNextLine(i - 1, -1)
            container.push(new DistancePointContainer(line));
            index++;
          }
        }


        data.setData(sortedLines, targetName);

      }
      observer.next(data);
      observer.complete();
    }));


    //this.prepareGraft({eraseMap: [{x: 1, y: 2, height: 100, width: 100}]})
  }

  public reducePoints(modulo: number = 10, sourceName: string = "sortedLines") {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
      const sortedLines = data.getData(sourceName);

      if (sortedLines instanceof DistancePointContainer) {
        console.log("Reduce Points");

        for (let i = 0; i < sortedLines.getLines().length; i++) {
          const p = new PointLine();
          const line = sortedLines.getLine(i);
          p.id = line.id;
          p.length = line.length;

          p.addPoint(line.getFirstPoint());

          for (let y = 1; y < line.points.length; y = y + modulo) {
            if (p.getLastPoint().x != line.points[y].x) {
              p.addPoint(line.points[y])
            }
          }

          if (p.getLastPoint().x != line.getLastPoint().x) {
            p.addPoint(line.getLastPoint())
          }
          sortedLines.setLine(i, p);
        }
      }
      observer.next(data);
      observer.complete();
    }));
  }

  public drawLines(color: string = "", size: number = 1, drawStartEndPoints = true, drawDistance = true, sourceName: string = "sortedLines") {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(data.img.data).pipe(map(canvas => {

        const sortedLines = data.getData(sourceName);

        if (sortedLines instanceof DistancePointContainer) {
          console.log('Draw Lines');

          for (let i = 0; i < sortedLines.getLines().length; i++) {
            const line = sortedLines.getLine(i);

            DrawUtil.drawPointLinesOnCanvas(canvas, line.points, color == "" ? CImageUtil.colors[i + 1] : color, size, false);

            if (drawStartEndPoints) {
              DrawUtil.text(canvas, "Start Line" + i, line.points[0], "12px Arial", "red");
              DrawUtil.drawPoint(canvas, line.points[0], "red");
              if (!drawDistance)
                DrawUtil.text(canvas, "End Line" + i, line.points[line.points.length - 1], "12px Arial", "blue");
              DrawUtil.drawPoint(canvas, line.points[line.points.length - 1], "blue");
            }

            if (drawDistance) {
              console.log(i + "" + String(sortedLines.getDistanceToNextLine(i)));
              DrawUtil.text(canvas, String(Math.round(sortedLines.getDistanceToNextLine(i))), line.points[line.points.length - 1], "16px Arial", "blue");
            }
          }
          data.img.data = DrawUtil.canvasAsBase64(canvas);
        }
        return data;
      }))
    );
  }

  public drawTest(color: string = "", size: number = 1, drawStartEndPoints = true, drawDistance = true, sourceName: string = "lines") {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(data.img.data).pipe(map(canvas => {

        // const sortedLines = data.getData(sourceName);

        // console.log(JSON.stringify(sortedLines));

        const test = "{\"lines\":[{\"points\":[{\"x\":354,\"y\":228,\"pos\":\"1\"},{\"x\":353,\"y\":228,\"pos\":\"2\"},{\"x\":352,\"y\":228,\"pos\":\"3\"},{\"x\":352,\"y\":229,\"pos\":\"4\"},{\"x\":351,\"y\":229,\"pos\":\"5\"},{\"x\":351,\"y\":230,\"pos\":\"6\"},{\"x\":350,\"y\":230,\"pos\":\"7\"},{\"x\":350,\"y\":231,\"pos\":\"8\"},{\"x\":349,\"y\":231,\"pos\":\"9\"},{\"x\":348,\"y\":232,\"pos\":\"10\"},{\"x\":348,\"y\":232,\"pos\":\"11\"},{\"x\":347,\"y\":232,\"pos\":\"12\"},{\"x\":347,\"y\":233,\"pos\":\"13\"},{\"x\":346,\"y\":233,\"pos\":\"14\"},{\"x\":346,\"y\":234,\"pos\":\"15\"},{\"x\":345,\"y\":234,\"pos\":\"16\"},{\"x\":345,\"y\":235,\"pos\":\"17\"},{\"x\":344,\"y\":235,\"pos\":\"18\"},{\"x\":344,\"y\":236,\"pos\":\"19\"},{\"x\":343,\"y\":236,\"pos\":\"20\"},{\"x\":343,\"y\":237,\"pos\":\"21\"},{\"x\":342,\"y\":237,\"pos\":\"22\"},{\"x\":342,\"y\":238,\"pos\":\"23\"},{\"x\":341,\"y\":238,\"pos\":\"24\"},{\"x\":341,\"y\":239,\"pos\":\"25\"},{\"x\":340,\"y\":239,\"pos\":\"26\"},{\"x\":340,\"y\":240,\"pos\":\"27\"},{\"x\":339,\"y\":240,\"pos\":\"28\"},{\"x\":339,\"y\":241,\"pos\":\"29\"},{\"x\":338,\"y\":241,\"pos\":\"30\"},{\"x\":338,\"y\":242,\"pos\":\"31\"},{\"x\":337,\"y\":242,\"pos\":\"32\"},{\"x\":337,\"y\":243,\"pos\":\"33\"},{\"x\":336,\"y\":243,\"pos\":\"34\"},{\"x\":336,\"y\":244,\"pos\":\"35\"},{\"x\":335,\"y\":244,\"pos\":\"36\"},{\"x\":335,\"y\":245,\"pos\":\"37\"},{\"x\":334,\"y\":245,\"pos\":\"38\"},{\"x\":334,\"y\":246,\"pos\":\"39\"},{\"x\":333,\"y\":246,\"pos\":\"40\"},{\"x\":333,\"y\":247,\"pos\":\"41\"},{\"x\":332,\"y\":247,\"pos\":\"42\"},{\"x\":332,\"y\":248,\"pos\":\"43\"},{\"x\":331,\"y\":248,\"pos\":\"44\"},{\"x\":331,\"y\":249,\"pos\":\"45\"},{\"x\":330,\"y\":250,\"pos\":\"46\"},{\"x\":330,\"y\":250,\"pos\":\"47\"},{\"x\":330,\"y\":251,\"pos\":\"48\"},{\"x\":329,\"y\":251,\"pos\":\"49\"},{\"x\":329,\"y\":252,\"pos\":\"50\"},{\"x\":329,\"y\":252,\"pos\":\"51\"},{\"x\":328,\"y\":253,\"pos\":\"52\"},{\"x\":328,\"y\":254,\"pos\":\"53\"},{\"x\":327,\"y\":254,\"pos\":\"54\"},{\"x\":327,\"y\":255,\"pos\":\"55\"},{\"x\":326,\"y\":255,\"pos\":\"56\"},{\"x\":326,\"y\":256,\"pos\":\"57\"},{\"x\":325,\"y\":256,\"pos\":\"58\"},{\"x\":325,\"y\":257,\"pos\":\"59\"},{\"x\":324,\"y\":257,\"pos\":\"60\"},{\"x\":324,\"y\":258,\"pos\":\"61\"},{\"x\":323,\"y\":258,\"pos\":\"62\"}],\"id\":\"103\",\"length\":\"44.200\"},{\"points\":[{\"x\":1056,\"y\":280,\"pos\":\"1\"},{\"x\":1056,\"y\":279,\"pos\":\"2\"},{\"x\":1055,\"y\":279,\"pos\":\"3\"},{\"x\":1055,\"y\":278,\"pos\":\"4\"},{\"x\":1054,\"y\":278,\"pos\":\"5\"},{\"x\":1054,\"y\":277,\"pos\":\"6\"},{\"x\":1053,\"y\":277,\"pos\":\"7\"},{\"x\":1053,\"y\":276,\"pos\":\"8\"},{\"x\":1052,\"y\":275,\"pos\":\"9\"},{\"x\":1052,\"y\":275,\"pos\":\"10\"},{\"x\":1052,\"y\":274,\"pos\":\"11\"},{\"x\":1051,\"y\":274,\"pos\":\"12\"},{\"x\":1051,\"y\":273,\"pos\":\"13\"},{\"x\":1050,\"y\":273,\"pos\":\"14\"},{\"x\":1050,\"y\":272,\"pos\":\"15\"},{\"x\":1049,\"y\":272,\"pos\":\"16\"},{\"x\":1049,\"y\":272,\"pos\":\"17\"},{\"x\":1048,\"y\":271,\"pos\":\"18\"},{\"x\":1047,\"y\":271,\"pos\":\"19\"},{\"x\":1047,\"y\":270,\"pos\":\"20\"},{\"x\":1046,\"y\":270,\"pos\":\"21\"},{\"x\":1046,\"y\":270,\"pos\":\"22\"},{\"x\":1045,\"y\":269,\"pos\":\"23\"},{\"x\":1044,\"y\":269,\"pos\":\"24\"},{\"x\":1044,\"y\":268,\"pos\":\"25\"},{\"x\":1043,\"y\":268,\"pos\":\"26\"},{\"x\":1042,\"y\":267,\"pos\":\"27\"},{\"x\":1042,\"y\":267,\"pos\":\"28\"},{\"x\":1041,\"y\":267,\"pos\":\"29\"},{\"x\":1040,\"y\":266,\"pos\":\"30\"},{\"x\":1039,\"y\":266,\"pos\":\"31\"},{\"x\":1039,\"y\":265,\"pos\":\"32\"},{\"x\":1038,\"y\":265,\"pos\":\"33\"},{\"x\":1037,\"y\":265,\"pos\":\"34\"},{\"x\":1037,\"y\":264,\"pos\":\"35\"},{\"x\":1036,\"y\":264,\"pos\":\"36\"},{\"x\":1036,\"y\":263,\"pos\":\"37\"},{\"x\":1035,\"y\":263,\"pos\":\"38\"},{\"x\":1034,\"y\":263,\"pos\":\"39\"},{\"x\":1034,\"y\":262,\"pos\":\"40\"},{\"x\":1033,\"y\":262,\"pos\":\"41\"},{\"x\":1032,\"y\":262,\"pos\":\"42\"},{\"x\":1031,\"y\":262,\"pos\":\"43\"},{\"x\":1030,\"y\":261,\"pos\":\"44\"},{\"x\":1029,\"y\":261,\"pos\":\"45\"},{\"x\":1028,\"y\":261,\"pos\":\"46\"},{\"x\":1027,\"y\":261,\"pos\":\"47\"},{\"x\":1026,\"y\":261,\"pos\":\"48\"},{\"x\":1025,\"y\":260,\"pos\":\"49\"},{\"x\":1024,\"y\":260,\"pos\":\"50\"},{\"x\":1023,\"y\":260,\"pos\":\"51\"},{\"x\":1022,\"y\":259,\"pos\":\"52\"},{\"x\":1021,\"y\":259,\"pos\":\"53\"},{\"x\":1020,\"y\":259,\"pos\":\"54\"},{\"x\":1019,\"y\":258,\"pos\":\"55\"},{\"x\":1018,\"y\":258,\"pos\":\"56\"},{\"x\":1018,\"y\":258,\"pos\":\"57\"},{\"x\":1017,\"y\":257,\"pos\":\"58\"},{\"x\":1016,\"y\":257,\"pos\":\"59\"},{\"x\":1016,\"y\":257,\"pos\":\"60\"},{\"x\":1015,\"y\":256,\"pos\":\"61\"},{\"x\":1014,\"y\":256,\"pos\":\"62\"},{\"x\":1013,\"y\":255,\"pos\":\"63\"},{\"x\":1013,\"y\":255,\"pos\":\"64\"},{\"x\":1012,\"y\":255,\"pos\":\"65\"},{\"x\":1011,\"y\":254,\"pos\":\"66\"},{\"x\":1011,\"y\":254,\"pos\":\"67\"},{\"x\":1010,\"y\":254,\"pos\":\"68\"},{\"x\":1010,\"y\":254,\"pos\":\"69\"},{\"x\":1009,\"y\":253,\"pos\":\"70\"},{\"x\":1008,\"y\":253,\"pos\":\"71\"},{\"x\":1008,\"y\":253,\"pos\":\"72\"},{\"x\":1007,\"y\":252,\"pos\":\"73\"},{\"x\":1006,\"y\":252,\"pos\":\"74\"},{\"x\":1005,\"y\":251,\"pos\":\"75\"},{\"x\":1005,\"y\":251,\"pos\":\"76\"},{\"x\":1004,\"y\":251,\"pos\":\"77\"},{\"x\":1003,\"y\":251,\"pos\":\"78\"},{\"x\":1003,\"y\":250,\"pos\":\"79\"},{\"x\":1002,\"y\":250,\"pos\":\"80\"},{\"x\":1001,\"y\":250,\"pos\":\"81\"},{\"x\":1001,\"y\":249,\"pos\":\"82\"},{\"x\":1000,\"y\":249,\"pos\":\"83\"},{\"x\":999,\"y\":249,\"pos\":\"84\"},{\"x\":999,\"y\":248,\"pos\":\"85\"},{\"x\":998,\"y\":248,\"pos\":\"86\"},{\"x\":997,\"y\":248,\"pos\":\"87\"},{\"x\":997,\"y\":247,\"pos\":\"88\"},{\"x\":996,\"y\":247,\"pos\":\"89\"},{\"x\":995,\"y\":247,\"pos\":\"90\"},{\"x\":994,\"y\":246,\"pos\":\"91\"},{\"x\":993,\"y\":246,\"pos\":\"92\"},{\"x\":992,\"y\":246,\"pos\":\"93\"},{\"x\":991,\"y\":245,\"pos\":\"94\"},{\"x\":990,\"y\":245,\"pos\":\"95\"},{\"x\":989,\"y\":245,\"pos\":\"96\"},{\"x\":988,\"y\":244,\"pos\":\"97\"},{\"x\":987,\"y\":244,\"pos\":\"98\"},{\"x\":986,\"y\":244,\"pos\":\"99\"},{\"x\":985,\"y\":243,\"pos\":\"100\"},{\"x\":984,\"y\":243,\"pos\":\"101\"},{\"x\":983,\"y\":243,\"pos\":\"102\"},{\"x\":982,\"y\":242,\"pos\":\"103\"},{\"x\":981,\"y\":242,\"pos\":\"104\"},{\"x\":980,\"y\":242,\"pos\":\"105\"},{\"x\":979,\"y\":242,\"pos\":\"106\"},{\"x\":978,\"y\":241,\"pos\":\"107\"},{\"x\":977,\"y\":241,\"pos\":\"108\"},{\"x\":976,\"y\":241,\"pos\":\"109\"},{\"x\":975,\"y\":240,\"pos\":\"110\"},{\"x\":974,\"y\":240,\"pos\":\"111\"},{\"x\":973,\"y\":240,\"pos\":\"112\"},{\"x\":972,\"y\":240,\"pos\":\"113\"},{\"x\":971,\"y\":239,\"pos\":\"114\"},{\"x\":970,\"y\":239,\"pos\":\"115\"},{\"x\":969,\"y\":239,\"pos\":\"116\"},{\"x\":968,\"y\":239,\"pos\":\"117\"},{\"x\":967,\"y\":238,\"pos\":\"118\"},{\"x\":966,\"y\":238,\"pos\":\"119\"},{\"x\":965,\"y\":238,\"pos\":\"120\"},{\"x\":964,\"y\":238,\"pos\":\"121\"},{\"x\":963,\"y\":237,\"pos\":\"122\"},{\"x\":962,\"y\":237,\"pos\":\"123\"},{\"x\":961,\"y\":237,\"pos\":\"124\"},{\"x\":960,\"y\":237,\"pos\":\"125\"},{\"x\":959,\"y\":236,\"pos\":\"126\"},{\"x\":958,\"y\":236,\"pos\":\"127\"},{\"x\":957,\"y\":236,\"pos\":\"128\"},{\"x\":956,\"y\":235,\"pos\":\"129\"},{\"x\":955,\"y\":235,\"pos\":\"130\"},{\"x\":954,\"y\":235,\"pos\":\"131\"},{\"x\":953,\"y\":234,\"pos\":\"132\"},{\"x\":952,\"y\":234,\"pos\":\"133\"},{\"x\":951,\"y\":234,\"pos\":\"134\"},{\"x\":950,\"y\":233,\"pos\":\"135\"},{\"x\":949,\"y\":233,\"pos\":\"136\"},{\"x\":948,\"y\":233,\"pos\":\"137\"},{\"x\":947,\"y\":233,\"pos\":\"138\"},{\"x\":946,\"y\":233,\"pos\":\"139\"},{\"x\":945,\"y\":232,\"pos\":\"140\"},{\"x\":944,\"y\":232,\"pos\":\"141\"},{\"x\":943,\"y\":232,\"pos\":\"142\"},{\"x\":942,\"y\":232,\"pos\":\"143\"}],\"id\":\"151\",\"length\":\"125.827\"},{\"points\":[{\"x\":942,\"y\":232,\"pos\":\"1\"},{\"x\":941,\"y\":231,\"pos\":\"2\"},{\"x\":940,\"y\":231,\"pos\":\"3\"},{\"x\":939,\"y\":231,\"pos\":\"4\"},{\"x\":938,\"y\":231,\"pos\":\"5\"},{\"x\":937,\"y\":231,\"pos\":\"6\"},{\"x\":936,\"y\":231,\"pos\":\"7\"},{\"x\":935,\"y\":230,\"pos\":\"8\"},{\"x\":934,\"y\":230,\"pos\":\"9\"},{\"x\":933,\"y\":230,\"pos\":\"10\"},{\"x\":933,\"y\":229,\"pos\":\"11\"},{\"x\":932,\"y\":229,\"pos\":\"12\"},{\"x\":931,\"y\":229,\"pos\":\"13\"},{\"x\":930,\"y\":228,\"pos\":\"14\"},{\"x\":930,\"y\":228,\"pos\":\"15\"},{\"x\":929,\"y\":228,\"pos\":\"16\"},{\"x\":928,\"y\":227,\"pos\":\"17\"},{\"x\":928,\"y\":227,\"pos\":\"18\"},{\"x\":927,\"y\":227,\"pos\":\"19\"},{\"x\":927,\"y\":227,\"pos\":\"20\"},{\"x\":926,\"y\":226,\"pos\":\"21\"},{\"x\":925,\"y\":226,\"pos\":\"22\"},{\"x\":925,\"y\":225,\"pos\":\"23\"},{\"x\":924,\"y\":225,\"pos\":\"24\"},{\"x\":924,\"y\":224,\"pos\":\"25\"},{\"x\":923,\"y\":224,\"pos\":\"26\"},{\"x\":923,\"y\":224,\"pos\":\"27\"},{\"x\":922,\"y\":223,\"pos\":\"28\"},{\"x\":921,\"y\":223,\"pos\":\"29\"},{\"x\":921,\"y\":222,\"pos\":\"30\"},{\"x\":920,\"y\":222,\"pos\":\"31\"},{\"x\":920,\"y\":222,\"pos\":\"32\"},{\"x\":919,\"y\":221,\"pos\":\"33\"},{\"x\":918,\"y\":221,\"pos\":\"34\"},{\"x\":918,\"y\":220,\"pos\":\"35\"},{\"x\":917,\"y\":220,\"pos\":\"36\"},{\"x\":917,\"y\":220,\"pos\":\"37\"},{\"x\":916,\"y\":219,\"pos\":\"38\"},{\"x\":915,\"y\":219,\"pos\":\"39\"},{\"x\":915,\"y\":218,\"pos\":\"40\"},{\"x\":914,\"y\":218,\"pos\":\"41\"},{\"x\":914,\"y\":217,\"pos\":\"42\"},{\"x\":913,\"y\":217,\"pos\":\"43\"},{\"x\":913,\"y\":216,\"pos\":\"44\"},{\"x\":912,\"y\":216,\"pos\":\"45\"},{\"x\":912,\"y\":215,\"pos\":\"46\"},{\"x\":911,\"y\":215,\"pos\":\"47\"},{\"x\":911,\"y\":214,\"pos\":\"48\"},{\"x\":910,\"y\":214,\"pos\":\"49\"},{\"x\":910,\"y\":213,\"pos\":\"50\"},{\"x\":909,\"y\":213,\"pos\":\"51\"},{\"x\":909,\"y\":212,\"pos\":\"52\"},{\"x\":909,\"y\":212,\"pos\":\"53\"},{\"x\":908,\"y\":211,\"pos\":\"54\"},{\"x\":908,\"y\":210,\"pos\":\"55\"},{\"x\":907,\"y\":210,\"pos\":\"56\"},{\"x\":907,\"y\":209,\"pos\":\"57\"},{\"x\":907,\"y\":209,\"pos\":\"58\"},{\"x\":906,\"y\":208,\"pos\":\"59\"},{\"x\":905,\"y\":208,\"pos\":\"60\"},{\"x\":905,\"y\":207,\"pos\":\"61\"},{\"x\":904,\"y\":207,\"pos\":\"62\"},{\"x\":904,\"y\":206,\"pos\":\"63\"},{\"x\":903,\"y\":206,\"pos\":\"64\"},{\"x\":903,\"y\":206,\"pos\":\"65\"},{\"x\":902,\"y\":205,\"pos\":\"66\"},{\"x\":901,\"y\":205,\"pos\":\"67\"},{\"x\":901,\"y\":204,\"pos\":\"68\"},{\"x\":900,\"y\":204,\"pos\":\"69\"},{\"x\":899,\"y\":204,\"pos\":\"70\"},{\"x\":899,\"y\":203,\"pos\":\"71\"},{\"x\":898,\"y\":203,\"pos\":\"72\"},{\"x\":897,\"y\":202,\"pos\":\"73\"},{\"x\":897,\"y\":202,\"pos\":\"74\"},{\"x\":896,\"y\":202,\"pos\":\"75\"},{\"x\":895,\"y\":201,\"pos\":\"76\"},{\"x\":895,\"y\":201,\"pos\":\"77\"},{\"x\":894,\"y\":201,\"pos\":\"78\"},{\"x\":893,\"y\":201,\"pos\":\"79\"},{\"x\":893,\"y\":200,\"pos\":\"80\"},{\"x\":892,\"y\":200,\"pos\":\"81\"},{\"x\":891,\"y\":200,\"pos\":\"82\"},{\"x\":890,\"y\":199,\"pos\":\"83\"},{\"x\":889,\"y\":199,\"pos\":\"84\"},{\"x\":888,\"y\":199,\"pos\":\"85\"},{\"x\":888,\"y\":198,\"pos\":\"86\"},{\"x\":887,\"y\":198,\"pos\":\"87\"},{\"x\":886,\"y\":198,\"pos\":\"88\"},{\"x\":886,\"y\":197,\"pos\":\"89\"},{\"x\":885,\"y\":197,\"pos\":\"90\"},{\"x\":884,\"y\":197,\"pos\":\"91\"},{\"x\":884,\"y\":196,\"pos\":\"92\"},{\"x\":883,\"y\":196,\"pos\":\"93\"},{\"x\":882,\"y\":196,\"pos\":\"94\"},{\"x\":882,\"y\":195,\"pos\":\"95\"},{\"x\":881,\"y\":195,\"pos\":\"96\"},{\"x\":880,\"y\":195,\"pos\":\"97\"},{\"x\":880,\"y\":194,\"pos\":\"98\"},{\"x\":879,\"y\":194,\"pos\":\"99\"},{\"x\":878,\"y\":194,\"pos\":\"100\"},{\"x\":878,\"y\":194,\"pos\":\"101\"},{\"x\":877,\"y\":193,\"pos\":\"102\"},{\"x\":876,\"y\":193,\"pos\":\"103\"},{\"x\":875,\"y\":192,\"pos\":\"104\"},{\"x\":874,\"y\":192,\"pos\":\"105\"},{\"x\":873,\"y\":192,\"pos\":\"106\"},{\"x\":872,\"y\":191,\"pos\":\"107\"},{\"x\":871,\"y\":191,\"pos\":\"108\"},{\"x\":870,\"y\":191,\"pos\":\"109\"},{\"x\":869,\"y\":190,\"pos\":\"110\"},{\"x\":868,\"y\":190,\"pos\":\"111\"},{\"x\":868,\"y\":190,\"pos\":\"112\"},{\"x\":867,\"y\":189,\"pos\":\"113\"},{\"x\":866,\"y\":189,\"pos\":\"114\"},{\"x\":866,\"y\":188,\"pos\":\"115\"},{\"x\":865,\"y\":188,\"pos\":\"116\"},{\"x\":864,\"y\":188,\"pos\":\"117\"},{\"x\":864,\"y\":187,\"pos\":\"118\"},{\"x\":863,\"y\":187,\"pos\":\"119\"},{\"x\":862,\"y\":186,\"pos\":\"120\"},{\"x\":862,\"y\":186,\"pos\":\"121\"},{\"x\":861,\"y\":186,\"pos\":\"122\"},{\"x\":860,\"y\":185,\"pos\":\"123\"},{\"x\":860,\"y\":185,\"pos\":\"124\"},{\"x\":859,\"y\":185,\"pos\":\"125\"},{\"x\":858,\"y\":184,\"pos\":\"126\"},{\"x\":858,\"y\":184,\"pos\":\"127\"},{\"x\":857,\"y\":184,\"pos\":\"128\"},{\"x\":856,\"y\":184,\"pos\":\"129\"},{\"x\":856,\"y\":183,\"pos\":\"130\"},{\"x\":855,\"y\":183,\"pos\":\"131\"},{\"x\":854,\"y\":183,\"pos\":\"132\"},{\"x\":854,\"y\":182,\"pos\":\"133\"},{\"x\":853,\"y\":182,\"pos\":\"134\"},{\"x\":852,\"y\":182,\"pos\":\"135\"},{\"x\":852,\"y\":181,\"pos\":\"136\"},{\"x\":851,\"y\":181,\"pos\":\"137\"},{\"x\":850,\"y\":181,\"pos\":\"138\"},{\"x\":850,\"y\":180,\"pos\":\"139\"},{\"x\":849,\"y\":180,\"pos\":\"140\"},{\"x\":848,\"y\":179,\"pos\":\"141\"},{\"x\":848,\"y\":179,\"pos\":\"142\"},{\"x\":847,\"y\":179,\"pos\":\"143\"},{\"x\":846,\"y\":178,\"pos\":\"144\"},{\"x\":846,\"y\":178,\"pos\":\"145\"},{\"x\":845,\"y\":178,\"pos\":\"146\"},{\"x\":844,\"y\":178,\"pos\":\"147\"},{\"x\":844,\"y\":177,\"pos\":\"148\"},{\"x\":843,\"y\":177,\"pos\":\"149\"},{\"x\":842,\"y\":177,\"pos\":\"150\"},{\"x\":842,\"y\":176,\"pos\":\"151\"},{\"x\":841,\"y\":176,\"pos\":\"152\"},{\"x\":840,\"y\":176,\"pos\":\"153\"},{\"x\":839,\"y\":175,\"pos\":\"154\"},{\"x\":838,\"y\":175,\"pos\":\"155\"},{\"x\":837,\"y\":175,\"pos\":\"156\"},{\"x\":836,\"y\":174,\"pos\":\"157\"},{\"x\":835,\"y\":174,\"pos\":\"158\"},{\"x\":834,\"y\":173,\"pos\":\"159\"},{\"x\":833,\"y\":173,\"pos\":\"160\"},{\"x\":832,\"y\":173,\"pos\":\"161\"},{\"x\":831,\"y\":172,\"pos\":\"162\"},{\"x\":830,\"y\":172,\"pos\":\"163\"},{\"x\":829,\"y\":171,\"pos\":\"164\"},{\"x\":828,\"y\":171,\"pos\":\"165\"},{\"x\":827,\"y\":171,\"pos\":\"166\"},{\"x\":826,\"y\":170,\"pos\":\"167\"},{\"x\":825,\"y\":170,\"pos\":\"168\"},{\"x\":824,\"y\":170,\"pos\":\"169\"},{\"x\":823,\"y\":169,\"pos\":\"170\"},{\"x\":822,\"y\":169,\"pos\":\"171\"},{\"x\":821,\"y\":169,\"pos\":\"172\"},{\"x\":820,\"y\":169,\"pos\":\"173\"},{\"x\":819,\"y\":168,\"pos\":\"174\"},{\"x\":818,\"y\":168,\"pos\":\"175\"},{\"x\":817,\"y\":168,\"pos\":\"176\"},{\"x\":816,\"y\":168,\"pos\":\"177\"},{\"x\":815,\"y\":167,\"pos\":\"178\"},{\"x\":814,\"y\":167,\"pos\":\"179\"},{\"x\":813,\"y\":167,\"pos\":\"180\"},{\"x\":812,\"y\":166,\"pos\":\"181\"},{\"x\":811,\"y\":166,\"pos\":\"182\"},{\"x\":810,\"y\":166,\"pos\":\"183\"},{\"x\":809,\"y\":165,\"pos\":\"184\"},{\"x\":808,\"y\":165,\"pos\":\"185\"},{\"x\":807,\"y\":165,\"pos\":\"186\"},{\"x\":806,\"y\":164,\"pos\":\"187\"},{\"x\":805,\"y\":164,\"pos\":\"188\"},{\"x\":804,\"y\":164,\"pos\":\"189\"},{\"x\":803,\"y\":163,\"pos\":\"190\"},{\"x\":802,\"y\":163,\"pos\":\"191\"},{\"x\":801,\"y\":163,\"pos\":\"192\"},{\"x\":800,\"y\":163,\"pos\":\"193\"},{\"x\":799,\"y\":162,\"pos\":\"194\"},{\"x\":798,\"y\":162,\"pos\":\"195\"},{\"x\":797,\"y\":162,\"pos\":\"196\"},{\"x\":796,\"y\":162,\"pos\":\"197\"},{\"x\":795,\"y\":161,\"pos\":\"198\"},{\"x\":794,\"y\":161,\"pos\":\"199\"},{\"x\":793,\"y\":161,\"pos\":\"200\"},{\"x\":792,\"y\":161,\"pos\":\"201\"},{\"x\":791,\"y\":160,\"pos\":\"202\"},{\"x\":790,\"y\":160,\"pos\":\"203\"},{\"x\":789,\"y\":160,\"pos\":\"204\"},{\"x\":788,\"y\":160,\"pos\":\"205\"},{\"x\":787,\"y\":159,\"pos\":\"206\"},{\"x\":786,\"y\":159,\"pos\":\"207\"},{\"x\":785,\"y\":159,\"pos\":\"208\"},{\"x\":784,\"y\":159,\"pos\":\"209\"},{\"x\":783,\"y\":158,\"pos\":\"210\"},{\"x\":782,\"y\":158,\"pos\":\"211\"},{\"x\":781,\"y\":158,\"pos\":\"212\"},{\"x\":780,\"y\":158,\"pos\":\"213\"},{\"x\":779,\"y\":157,\"pos\":\"214\"},{\"x\":778,\"y\":157,\"pos\":\"215\"},{\"x\":777,\"y\":157,\"pos\":\"216\"},{\"x\":776,\"y\":157,\"pos\":\"217\"},{\"x\":775,\"y\":156,\"pos\":\"218\"},{\"x\":774,\"y\":156,\"pos\":\"219\"},{\"x\":773,\"y\":156,\"pos\":\"220\"},{\"x\":772,\"y\":156,\"pos\":\"221\"},{\"x\":771,\"y\":156,\"pos\":\"222\"},{\"x\":770,\"y\":155,\"pos\":\"223\"},{\"x\":769,\"y\":155,\"pos\":\"224\"},{\"x\":768,\"y\":155,\"pos\":\"225\"},{\"x\":767,\"y\":155,\"pos\":\"226\"},{\"x\":766,\"y\":155,\"pos\":\"227\"},{\"x\":765,\"y\":154,\"pos\":\"228\"},{\"x\":764,\"y\":154,\"pos\":\"229\"},{\"x\":763,\"y\":154,\"pos\":\"230\"},{\"x\":762,\"y\":154,\"pos\":\"231\"},{\"x\":761,\"y\":154,\"pos\":\"232\"},{\"x\":760,\"y\":153,\"pos\":\"233\"},{\"x\":759,\"y\":153,\"pos\":\"234\"},{\"x\":758,\"y\":153,\"pos\":\"235\"},{\"x\":757,\"y\":153,\"pos\":\"236\"},{\"x\":756,\"y\":152,\"pos\":\"237\"},{\"x\":755,\"y\":152,\"pos\":\"238\"},{\"x\":754,\"y\":152,\"pos\":\"239\"},{\"x\":753,\"y\":151,\"pos\":\"240\"},{\"x\":752,\"y\":151,\"pos\":\"241\"},{\"x\":751,\"y\":151,\"pos\":\"242\"},{\"x\":750,\"y\":150,\"pos\":\"243\"},{\"x\":749,\"y\":150,\"pos\":\"244\"},{\"x\":749,\"y\":150,\"pos\":\"245\"},{\"x\":748,\"y\":149,\"pos\":\"246\"},{\"x\":747,\"y\":149,\"pos\":\"247\"},{\"x\":747,\"y\":149,\"pos\":\"248\"},{\"x\":746,\"y\":148,\"pos\":\"249\"},{\"x\":745,\"y\":148,\"pos\":\"250\"},{\"x\":745,\"y\":148,\"pos\":\"251\"},{\"x\":744,\"y\":147,\"pos\":\"252\"},{\"x\":743,\"y\":147,\"pos\":\"253\"},{\"x\":743,\"y\":146,\"pos\":\"254\"},{\"x\":742,\"y\":146,\"pos\":\"255\"},{\"x\":741,\"y\":146,\"pos\":\"256\"},{\"x\":741,\"y\":145,\"pos\":\"257\"},{\"x\":740,\"y\":145,\"pos\":\"258\"},{\"x\":739,\"y\":145,\"pos\":\"259\"},{\"x\":739,\"y\":144,\"pos\":\"260\"},{\"x\":738,\"y\":144,\"pos\":\"261\"},{\"x\":737,\"y\":144,\"pos\":\"262\"},{\"x\":737,\"y\":144,\"pos\":\"263\"},{\"x\":736,\"y\":143,\"pos\":\"264\"},{\"x\":735,\"y\":143,\"pos\":\"265\"},{\"x\":734,\"y\":142,\"pos\":\"266\"},{\"x\":733,\"y\":142,\"pos\":\"267\"},{\"x\":732,\"y\":142,\"pos\":\"268\"},{\"x\":731,\"y\":141,\"pos\":\"269\"},{\"x\":730,\"y\":141,\"pos\":\"270\"},{\"x\":729,\"y\":141,\"pos\":\"271\"},{\"x\":728,\"y\":141,\"pos\":\"272\"},{\"x\":727,\"y\":140,\"pos\":\"273\"},{\"x\":726,\"y\":140,\"pos\":\"274\"},{\"x\":725,\"y\":140,\"pos\":\"275\"},{\"x\":724,\"y\":139,\"pos\":\"276\"},{\"x\":723,\"y\":139,\"pos\":\"277\"},{\"x\":722,\"y\":139,\"pos\":\"278\"},{\"x\":721,\"y\":139,\"pos\":\"279\"},{\"x\":720,\"y\":138,\"pos\":\"280\"},{\"x\":719,\"y\":138,\"pos\":\"281\"},{\"x\":718,\"y\":138,\"pos\":\"282\"},{\"x\":717,\"y\":138,\"pos\":\"283\"},{\"x\":716,\"y\":138,\"pos\":\"284\"},{\"x\":715,\"y\":138,\"pos\":\"285\"},{\"x\":714,\"y\":138,\"pos\":\"286\"},{\"x\":713,\"y\":138,\"pos\":\"287\"},{\"x\":712,\"y\":137,\"pos\":\"288\"},{\"x\":711,\"y\":137,\"pos\":\"289\"},{\"x\":710,\"y\":137,\"pos\":\"290\"},{\"x\":709,\"y\":137,\"pos\":\"291\"},{\"x\":708,\"y\":137,\"pos\":\"292\"},{\"x\":707,\"y\":137,\"pos\":\"293\"},{\"x\":706,\"y\":137,\"pos\":\"294\"},{\"x\":705,\"y\":137,\"pos\":\"295\"},{\"x\":704,\"y\":137,\"pos\":\"296\"},{\"x\":703,\"y\":137,\"pos\":\"297\"},{\"x\":702,\"y\":137,\"pos\":\"298\"},{\"x\":701,\"y\":138,\"pos\":\"299\"},{\"x\":700,\"y\":138,\"pos\":\"300\"},{\"x\":699,\"y\":138,\"pos\":\"301\"},{\"x\":698,\"y\":138,\"pos\":\"302\"},{\"x\":697,\"y\":138,\"pos\":\"303\"},{\"x\":696,\"y\":138,\"pos\":\"304\"},{\"x\":695,\"y\":138,\"pos\":\"305\"},{\"x\":694,\"y\":138,\"pos\":\"306\"},{\"x\":693,\"y\":138,\"pos\":\"307\"},{\"x\":692,\"y\":138,\"pos\":\"308\"},{\"x\":691,\"y\":138,\"pos\":\"309\"},{\"x\":690,\"y\":138,\"pos\":\"310\"},{\"x\":689,\"y\":138,\"pos\":\"311\"},{\"x\":688,\"y\":138,\"pos\":\"312\"},{\"x\":687,\"y\":137,\"pos\":\"313\"},{\"x\":686,\"y\":137,\"pos\":\"314\"},{\"x\":685,\"y\":137,\"pos\":\"315\"},{\"x\":684,\"y\":137,\"pos\":\"316\"},{\"x\":683,\"y\":137,\"pos\":\"317\"},{\"x\":682,\"y\":137,\"pos\":\"318\"},{\"x\":681,\"y\":137,\"pos\":\"319\"},{\"x\":680,\"y\":137,\"pos\":\"320\"},{\"x\":679,\"y\":137,\"pos\":\"321\"},{\"x\":678,\"y\":137,\"pos\":\"322\"},{\"x\":677,\"y\":137,\"pos\":\"323\"},{\"x\":676,\"y\":137,\"pos\":\"324\"},{\"x\":675,\"y\":137,\"pos\":\"325\"},{\"x\":674,\"y\":137,\"pos\":\"326\"},{\"x\":673,\"y\":136,\"pos\":\"327\"},{\"x\":672,\"y\":136,\"pos\":\"328\"},{\"x\":671,\"y\":136,\"pos\":\"329\"},{\"x\":670,\"y\":136,\"pos\":\"330\"},{\"x\":669,\"y\":136,\"pos\":\"331\"},{\"x\":668,\"y\":136,\"pos\":\"332\"},{\"x\":667,\"y\":136,\"pos\":\"333\"},{\"x\":666,\"y\":136,\"pos\":\"334\"},{\"x\":665,\"y\":135,\"pos\":\"335\"},{\"x\":664,\"y\":135,\"pos\":\"336\"},{\"x\":663,\"y\":135,\"pos\":\"337\"},{\"x\":662,\"y\":135,\"pos\":\"338\"},{\"x\":661,\"y\":135,\"pos\":\"339\"},{\"x\":660,\"y\":135,\"pos\":\"340\"},{\"x\":659,\"y\":135,\"pos\":\"341\"},{\"x\":658,\"y\":135,\"pos\":\"342\"},{\"x\":657,\"y\":135,\"pos\":\"343\"},{\"x\":656,\"y\":134,\"pos\":\"344\"},{\"x\":655,\"y\":134,\"pos\":\"345\"},{\"x\":654,\"y\":134,\"pos\":\"346\"},{\"x\":653,\"y\":134,\"pos\":\"347\"},{\"x\":652,\"y\":134,\"pos\":\"348\"},{\"x\":651,\"y\":133,\"pos\":\"349\"},{\"x\":650,\"y\":133,\"pos\":\"350\"},{\"x\":649,\"y\":133,\"pos\":\"351\"},{\"x\":648,\"y\":133,\"pos\":\"352\"},{\"x\":647,\"y\":132,\"pos\":\"353\"},{\"x\":646,\"y\":132,\"pos\":\"354\"},{\"x\":645,\"y\":132,\"pos\":\"355\"},{\"x\":644,\"y\":132,\"pos\":\"356\"},{\"x\":643,\"y\":132,\"pos\":\"357\"},{\"x\":642,\"y\":132,\"pos\":\"358\"},{\"x\":641,\"y\":132,\"pos\":\"359\"},{\"x\":640,\"y\":132,\"pos\":\"360\"},{\"x\":639,\"y\":132,\"pos\":\"361\"},{\"x\":638,\"y\":132,\"pos\":\"362\"},{\"x\":637,\"y\":133,\"pos\":\"363\"},{\"x\":636,\"y\":133,\"pos\":\"364\"},{\"x\":635,\"y\":133,\"pos\":\"365\"},{\"x\":634,\"y\":134,\"pos\":\"366\"},{\"x\":633,\"y\":134,\"pos\":\"367\"},{\"x\":632,\"y\":134,\"pos\":\"368\"},{\"x\":631,\"y\":135,\"pos\":\"369\"},{\"x\":630,\"y\":135,\"pos\":\"370\"},{\"x\":629,\"y\":135,\"pos\":\"371\"},{\"x\":628,\"y\":136,\"pos\":\"372\"},{\"x\":627,\"y\":136,\"pos\":\"373\"},{\"x\":626,\"y\":136,\"pos\":\"374\"},{\"x\":625,\"y\":136,\"pos\":\"375\"},{\"x\":624,\"y\":136,\"pos\":\"376\"},{\"x\":623,\"y\":136,\"pos\":\"377\"},{\"x\":622,\"y\":136,\"pos\":\"378\"},{\"x\":621,\"y\":136,\"pos\":\"379\"},{\"x\":620,\"y\":136,\"pos\":\"380\"},{\"x\":619,\"y\":136,\"pos\":\"381\"},{\"x\":618,\"y\":136,\"pos\":\"382\"},{\"x\":617,\"y\":136,\"pos\":\"383\"},{\"x\":616,\"y\":136,\"pos\":\"384\"},{\"x\":615,\"y\":136,\"pos\":\"385\"},{\"x\":614,\"y\":136,\"pos\":\"386\"},{\"x\":613,\"y\":136,\"pos\":\"387\"},{\"x\":612,\"y\":136,\"pos\":\"388\"},{\"x\":611,\"y\":136,\"pos\":\"389\"},{\"x\":610,\"y\":136,\"pos\":\"390\"},{\"x\":609,\"y\":136,\"pos\":\"391\"},{\"x\":608,\"y\":136,\"pos\":\"392\"},{\"x\":607,\"y\":136,\"pos\":\"393\"},{\"x\":606,\"y\":136,\"pos\":\"394\"},{\"x\":605,\"y\":137,\"pos\":\"395\"},{\"x\":604,\"y\":137,\"pos\":\"396\"},{\"x\":603,\"y\":137,\"pos\":\"397\"},{\"x\":602,\"y\":137,\"pos\":\"398\"},{\"x\":601,\"y\":137,\"pos\":\"399\"},{\"x\":600,\"y\":137,\"pos\":\"400\"},{\"x\":599,\"y\":137,\"pos\":\"401\"},{\"x\":598,\"y\":137,\"pos\":\"402\"},{\"x\":597,\"y\":137,\"pos\":\"403\"},{\"x\":596,\"y\":136,\"pos\":\"404\"},{\"x\":595,\"y\":136,\"pos\":\"405\"},{\"x\":594,\"y\":136,\"pos\":\"406\"},{\"x\":593,\"y\":136,\"pos\":\"407\"},{\"x\":592,\"y\":136,\"pos\":\"408\"},{\"x\":591,\"y\":136,\"pos\":\"409\"},{\"x\":590,\"y\":136,\"pos\":\"410\"},{\"x\":589,\"y\":136,\"pos\":\"411\"},{\"x\":588,\"y\":136,\"pos\":\"412\"},{\"x\":587,\"y\":135,\"pos\":\"413\"},{\"x\":586,\"y\":135,\"pos\":\"414\"},{\"x\":585,\"y\":135,\"pos\":\"415\"},{\"x\":584,\"y\":135,\"pos\":\"416\"},{\"x\":583,\"y\":135,\"pos\":\"417\"},{\"x\":582,\"y\":135,\"pos\":\"418\"},{\"x\":581,\"y\":135,\"pos\":\"419\"}],\"id\":\"152\",\"length\":\"384.882\"},{\"points\":[{\"x\":361,\"y\":210,\"pos\":\"1\"},{\"x\":360,\"y\":210,\"pos\":\"2\"},{\"x\":359,\"y\":210,\"pos\":\"3\"},{\"x\":358,\"y\":210,\"pos\":\"4\"},{\"x\":357,\"y\":210,\"pos\":\"5\"},{\"x\":356,\"y\":211,\"pos\":\"6\"},{\"x\":355,\"y\":211,\"pos\":\"7\"},{\"x\":355,\"y\":212,\"pos\":\"8\"},{\"x\":354,\"y\":212,\"pos\":\"9\"},{\"x\":353,\"y\":212,\"pos\":\"10\"},{\"x\":353,\"y\":213,\"pos\":\"11\"},{\"x\":352,\"y\":213,\"pos\":\"12\"},{\"x\":352,\"y\":213,\"pos\":\"13\"},{\"x\":351,\"y\":214,\"pos\":\"14\"},{\"x\":350,\"y\":214,\"pos\":\"15\"},{\"x\":350,\"y\":215,\"pos\":\"16\"},{\"x\":349,\"y\":215,\"pos\":\"17\"},{\"x\":348,\"y\":215,\"pos\":\"18\"},{\"x\":348,\"y\":215,\"pos\":\"19\"},{\"x\":347,\"y\":216,\"pos\":\"20\"},{\"x\":346,\"y\":216,\"pos\":\"21\"},{\"x\":346,\"y\":216,\"pos\":\"22\"},{\"x\":345,\"y\":217,\"pos\":\"23\"},{\"x\":344,\"y\":217,\"pos\":\"24\"},{\"x\":343,\"y\":218,\"pos\":\"25\"},{\"x\":342,\"y\":218,\"pos\":\"26\"},{\"x\":342,\"y\":218,\"pos\":\"27\"},{\"x\":341,\"y\":219,\"pos\":\"28\"},{\"x\":340,\"y\":219,\"pos\":\"29\"},{\"x\":340,\"y\":219,\"pos\":\"30\"},{\"x\":339,\"y\":220,\"pos\":\"31\"},{\"x\":338,\"y\":220,\"pos\":\"32\"},{\"x\":338,\"y\":221,\"pos\":\"33\"},{\"x\":337,\"y\":221,\"pos\":\"34\"},{\"x\":336,\"y\":221,\"pos\":\"35\"},{\"x\":336,\"y\":222,\"pos\":\"36\"},{\"x\":335,\"y\":222,\"pos\":\"37\"},{\"x\":335,\"y\":223,\"pos\":\"38\"},{\"x\":334,\"y\":223,\"pos\":\"39\"},{\"x\":333,\"y\":224,\"pos\":\"40\"},{\"x\":333,\"y\":224,\"pos\":\"41\"},{\"x\":332,\"y\":224,\"pos\":\"42\"},{\"x\":332,\"y\":225,\"pos\":\"43\"},{\"x\":331,\"y\":225,\"pos\":\"44\"},{\"x\":331,\"y\":226,\"pos\":\"45\"},{\"x\":330,\"y\":226,\"pos\":\"46\"},{\"x\":330,\"y\":227,\"pos\":\"47\"},{\"x\":329,\"y\":227,\"pos\":\"48\"},{\"x\":329,\"y\":228,\"pos\":\"49\"},{\"x\":328,\"y\":228,\"pos\":\"50\"},{\"x\":328,\"y\":229,\"pos\":\"51\"},{\"x\":327,\"y\":229,\"pos\":\"52\"},{\"x\":327,\"y\":230,\"pos\":\"53\"},{\"x\":326,\"y\":230,\"pos\":\"54\"},{\"x\":326,\"y\":231,\"pos\":\"55\"},{\"x\":325,\"y\":231,\"pos\":\"56\"},{\"x\":325,\"y\":232,\"pos\":\"57\"},{\"x\":325,\"y\":233,\"pos\":\"58\"},{\"x\":324,\"y\":233,\"pos\":\"59\"},{\"x\":324,\"y\":234,\"pos\":\"60\"},{\"x\":323,\"y\":234,\"pos\":\"61\"},{\"x\":323,\"y\":235,\"pos\":\"62\"},{\"x\":322,\"y\":235,\"pos\":\"63\"},{\"x\":322,\"y\":236,\"pos\":\"64\"},{\"x\":321,\"y\":236,\"pos\":\"65\"},{\"x\":321,\"y\":237,\"pos\":\"66\"},{\"x\":320,\"y\":237,\"pos\":\"67\"},{\"x\":320,\"y\":238,\"pos\":\"68\"},{\"x\":319,\"y\":238,\"pos\":\"69\"},{\"x\":319,\"y\":239,\"pos\":\"70\"},{\"x\":318,\"y\":239,\"pos\":\"71\"},{\"x\":318,\"y\":240,\"pos\":\"72\"},{\"x\":317,\"y\":240,\"pos\":\"73\"},{\"x\":317,\"y\":241,\"pos\":\"74\"},{\"x\":316,\"y\":241,\"pos\":\"75\"},{\"x\":316,\"y\":242,\"pos\":\"76\"},{\"x\":315,\"y\":242,\"pos\":\"77\"},{\"x\":314,\"y\":243,\"pos\":\"78\"},{\"x\":314,\"y\":243,\"pos\":\"79\"},{\"x\":313,\"y\":243,\"pos\":\"80\"},{\"x\":313,\"y\":244,\"pos\":\"81\"},{\"x\":312,\"y\":244,\"pos\":\"82\"},{\"x\":312,\"y\":245,\"pos\":\"83\"},{\"x\":311,\"y\":245,\"pos\":\"84\"},{\"x\":311,\"y\":246,\"pos\":\"85\"},{\"x\":310,\"y\":246,\"pos\":\"86\"},{\"x\":309,\"y\":247,\"pos\":\"87\"},{\"x\":309,\"y\":247,\"pos\":\"88\"},{\"x\":308,\"y\":247,\"pos\":\"89\"},{\"x\":308,\"y\":248,\"pos\":\"90\"},{\"x\":307,\"y\":248,\"pos\":\"91\"},{\"x\":307,\"y\":249,\"pos\":\"92\"},{\"x\":306,\"y\":249,\"pos\":\"93\"},{\"x\":305,\"y\":250,\"pos\":\"94\"},{\"x\":305,\"y\":250,\"pos\":\"95\"},{\"x\":304,\"y\":250,\"pos\":\"96\"},{\"x\":304,\"y\":250,\"pos\":\"97\"},{\"x\":303,\"y\":251,\"pos\":\"98\"},{\"x\":302,\"y\":251,\"pos\":\"99\"},{\"x\":301,\"y\":252,\"pos\":\"100\"},{\"x\":300,\"y\":252,\"pos\":\"101\"},{\"x\":299,\"y\":252,\"pos\":\"102\"},{\"x\":298,\"y\":253,\"pos\":\"103\"},{\"x\":297,\"y\":253,\"pos\":\"104\"},{\"x\":296,\"y\":253,\"pos\":\"105\"},{\"x\":295,\"y\":254,\"pos\":\"106\"},{\"x\":294,\"y\":254,\"pos\":\"107\"},{\"x\":293,\"y\":255,\"pos\":\"108\"},{\"x\":293,\"y\":255,\"pos\":\"109\"},{\"x\":292,\"y\":255,\"pos\":\"110\"},{\"x\":291,\"y\":255,\"pos\":\"111\"},{\"x\":291,\"y\":256,\"pos\":\"112\"},{\"x\":290,\"y\":256,\"pos\":\"113\"},{\"x\":289,\"y\":256,\"pos\":\"114\"},{\"x\":289,\"y\":257,\"pos\":\"115\"},{\"x\":288,\"y\":257,\"pos\":\"116\"},{\"x\":287,\"y\":257,\"pos\":\"117\"},{\"x\":287,\"y\":258,\"pos\":\"118\"},{\"x\":286,\"y\":258,\"pos\":\"119\"},{\"x\":285,\"y\":258,\"pos\":\"120\"},{\"x\":285,\"y\":259,\"pos\":\"121\"},{\"x\":284,\"y\":259,\"pos\":\"122\"},{\"x\":283,\"y\":259,\"pos\":\"123\"},{\"x\":283,\"y\":260,\"pos\":\"124\"},{\"x\":282,\"y\":260,\"pos\":\"125\"},{\"x\":281,\"y\":260,\"pos\":\"126\"},{\"x\":281,\"y\":261,\"pos\":\"127\"},{\"x\":280,\"y\":261,\"pos\":\"128\"},{\"x\":279,\"y\":261,\"pos\":\"129\"},{\"x\":279,\"y\":261,\"pos\":\"130\"},{\"x\":278,\"y\":262,\"pos\":\"131\"},{\"x\":277,\"y\":262,\"pos\":\"132\"},{\"x\":277,\"y\":263,\"pos\":\"133\"},{\"x\":276,\"y\":263,\"pos\":\"134\"},{\"x\":275,\"y\":263,\"pos\":\"135\"},{\"x\":275,\"y\":264,\"pos\":\"136\"},{\"x\":274,\"y\":264,\"pos\":\"137\"},{\"x\":274,\"y\":264,\"pos\":\"138\"},{\"x\":273,\"y\":265,\"pos\":\"139\"},{\"x\":272,\"y\":265,\"pos\":\"140\"},{\"x\":272,\"y\":266,\"pos\":\"141\"},{\"x\":271,\"y\":266,\"pos\":\"142\"},{\"x\":271,\"y\":266,\"pos\":\"143\"},{\"x\":270,\"y\":267,\"pos\":\"144\"},{\"x\":269,\"y\":267,\"pos\":\"145\"},{\"x\":269,\"y\":268,\"pos\":\"146\"},{\"x\":268,\"y\":268,\"pos\":\"147\"},{\"x\":267,\"y\":268,\"pos\":\"148\"},{\"x\":267,\"y\":269,\"pos\":\"149\"},{\"x\":266,\"y\":269,\"pos\":\"150\"},{\"x\":266,\"y\":270,\"pos\":\"151\"},{\"x\":265,\"y\":270,\"pos\":\"152\"},{\"x\":264,\"y\":270,\"pos\":\"153\"},{\"x\":264,\"y\":271,\"pos\":\"154\"}],\"id\":\"156\",\"length\":\"116.875\"},{\"points\":[{\"x\":314,\"y\":265,\"pos\":\"1\"},{\"x\":313,\"y\":266,\"pos\":\"2\"},{\"x\":313,\"y\":266,\"pos\":\"3\"},{\"x\":312,\"y\":266,\"pos\":\"4\"},{\"x\":311,\"y\":267,\"pos\":\"5\"},{\"x\":311,\"y\":267,\"pos\":\"6\"},{\"x\":310,\"y\":267,\"pos\":\"7\"},{\"x\":310,\"y\":268,\"pos\":\"8\"},{\"x\":309,\"y\":268,\"pos\":\"9\"},{\"x\":308,\"y\":268,\"pos\":\"10\"},{\"x\":308,\"y\":269,\"pos\":\"11\"},{\"x\":307,\"y\":269,\"pos\":\"12\"},{\"x\":307,\"y\":270,\"pos\":\"13\"},{\"x\":306,\"y\":270,\"pos\":\"14\"},{\"x\":306,\"y\":270,\"pos\":\"15\"},{\"x\":305,\"y\":271,\"pos\":\"16\"},{\"x\":304,\"y\":271,\"pos\":\"17\"},{\"x\":304,\"y\":272,\"pos\":\"18\"},{\"x\":303,\"y\":272,\"pos\":\"19\"},{\"x\":303,\"y\":273,\"pos\":\"20\"},{\"x\":302,\"y\":273,\"pos\":\"21\"},{\"x\":301,\"y\":274,\"pos\":\"22\"},{\"x\":301,\"y\":274,\"pos\":\"23\"},{\"x\":300,\"y\":274,\"pos\":\"24\"},{\"x\":300,\"y\":275,\"pos\":\"25\"},{\"x\":299,\"y\":275,\"pos\":\"26\"},{\"x\":298,\"y\":276,\"pos\":\"27\"},{\"x\":298,\"y\":276,\"pos\":\"28\"},{\"x\":297,\"y\":276,\"pos\":\"29\"},{\"x\":297,\"y\":276,\"pos\":\"30\"},{\"x\":296,\"y\":277,\"pos\":\"31\"},{\"x\":295,\"y\":277,\"pos\":\"32\"},{\"x\":295,\"y\":278,\"pos\":\"33\"},{\"x\":294,\"y\":278,\"pos\":\"34\"},{\"x\":294,\"y\":278,\"pos\":\"35\"},{\"x\":293,\"y\":279,\"pos\":\"36\"},{\"x\":292,\"y\":279,\"pos\":\"37\"},{\"x\":292,\"y\":280,\"pos\":\"38\"},{\"x\":291,\"y\":280,\"pos\":\"39\"},{\"x\":291,\"y\":281,\"pos\":\"40\"},{\"x\":290,\"y\":281,\"pos\":\"41\"}],\"id\":\"158\",\"length\":\"29.038\"},{\"points\":[{\"x\":219,\"y\":306,\"pos\":\"1\"},{\"x\":218,\"y\":306,\"pos\":\"2\"},{\"x\":217,\"y\":307,\"pos\":\"3\"},{\"x\":217,\"y\":307,\"pos\":\"4\"},{\"x\":216,\"y\":307,\"pos\":\"5\"},{\"x\":215,\"y\":308,\"pos\":\"6\"},{\"x\":214,\"y\":308,\"pos\":\"7\"},{\"x\":214,\"y\":309,\"pos\":\"8\"},{\"x\":213,\"y\":309,\"pos\":\"9\"},{\"x\":212,\"y\":309,\"pos\":\"10\"},{\"x\":212,\"y\":310,\"pos\":\"11\"},{\"x\":211,\"y\":310,\"pos\":\"12\"},{\"x\":211,\"y\":311,\"pos\":\"13\"},{\"x\":210,\"y\":311,\"pos\":\"14\"},{\"x\":210,\"y\":312,\"pos\":\"15\"},{\"x\":209,\"y\":312,\"pos\":\"16\"},{\"x\":208,\"y\":312,\"pos\":\"17\"},{\"x\":208,\"y\":313,\"pos\":\"18\"},{\"x\":207,\"y\":313,\"pos\":\"19\"},{\"x\":207,\"y\":314,\"pos\":\"20\"},{\"x\":206,\"y\":314,\"pos\":\"21\"},{\"x\":206,\"y\":315,\"pos\":\"22\"},{\"x\":205,\"y\":315,\"pos\":\"23\"},{\"x\":205,\"y\":316,\"pos\":\"24\"},{\"x\":204,\"y\":316,\"pos\":\"25\"},{\"x\":204,\"y\":317,\"pos\":\"26\"},{\"x\":203,\"y\":317,\"pos\":\"27\"},{\"x\":203,\"y\":318,\"pos\":\"28\"},{\"x\":202,\"y\":318,\"pos\":\"29\"},{\"x\":202,\"y\":319,\"pos\":\"30\"},{\"x\":201,\"y\":319,\"pos\":\"31\"}],\"id\":\"162\",\"length\":\"22.209\"},{\"points\":[{\"x\":140,\"y\":374,\"pos\":\"1\"},{\"x\":139,\"y\":374,\"pos\":\"2\"},{\"x\":139,\"y\":375,\"pos\":\"3\"},{\"x\":138,\"y\":375,\"pos\":\"4\"},{\"x\":138,\"y\":376,\"pos\":\"5\"},{\"x\":137,\"y\":376,\"pos\":\"6\"},{\"x\":137,\"y\":377,\"pos\":\"7\"},{\"x\":136,\"y\":377,\"pos\":\"8\"},{\"x\":136,\"y\":378,\"pos\":\"9\"},{\"x\":136,\"y\":378,\"pos\":\"10\"},{\"x\":135,\"y\":379,\"pos\":\"11\"},{\"x\":134,\"y\":380,\"pos\":\"12\"},{\"x\":134,\"y\":380,\"pos\":\"13\"},{\"x\":134,\"y\":381,\"pos\":\"14\"},{\"x\":133,\"y\":381,\"pos\":\"15\"},{\"x\":133,\"y\":382,\"pos\":\"16\"},{\"x\":132,\"y\":382,\"pos\":\"17\"},{\"x\":132,\"y\":383,\"pos\":\"18\"},{\"x\":131,\"y\":383,\"pos\":\"19\"},{\"x\":131,\"y\":384,\"pos\":\"20\"},{\"x\":130,\"y\":384,\"pos\":\"21\"},{\"x\":130,\"y\":384,\"pos\":\"22\"},{\"x\":129,\"y\":385,\"pos\":\"23\"},{\"x\":128,\"y\":385,\"pos\":\"24\"},{\"x\":128,\"y\":386,\"pos\":\"25\"},{\"x\":127,\"y\":386,\"pos\":\"26\"},{\"x\":127,\"y\":387,\"pos\":\"27\"},{\"x\":126,\"y\":387,\"pos\":\"28\"},{\"x\":126,\"y\":388,\"pos\":\"29\"},{\"x\":126,\"y\":389,\"pos\":\"30\"},{\"x\":125,\"y\":389,\"pos\":\"31\"},{\"x\":125,\"y\":390,\"pos\":\"32\"},{\"x\":124,\"y\":390,\"pos\":\"33\"},{\"x\":124,\"y\":391,\"pos\":\"34\"},{\"x\":123,\"y\":391,\"pos\":\"35\"},{\"x\":123,\"y\":392,\"pos\":\"36\"},{\"x\":123,\"y\":392,\"pos\":\"37\"},{\"x\":122,\"y\":393,\"pos\":\"38\"},{\"x\":122,\"y\":394,\"pos\":\"39\"},{\"x\":121,\"y\":394,\"pos\":\"40\"},{\"x\":121,\"y\":395,\"pos\":\"41\"},{\"x\":120,\"y\":395,\"pos\":\"42\"},{\"x\":120,\"y\":396,\"pos\":\"43\"},{\"x\":120,\"y\":397,\"pos\":\"44\"},{\"x\":119,\"y\":397,\"pos\":\"45\"},{\"x\":119,\"y\":398,\"pos\":\"46\"},{\"x\":118,\"y\":398,\"pos\":\"47\"},{\"x\":118,\"y\":399,\"pos\":\"48\"},{\"x\":118,\"y\":399,\"pos\":\"49\"},{\"x\":117,\"y\":400,\"pos\":\"50\"},{\"x\":117,\"y\":401,\"pos\":\"51\"},{\"x\":116,\"y\":401,\"pos\":\"52\"},{\"x\":116,\"y\":402,\"pos\":\"53\"},{\"x\":115,\"y\":402,\"pos\":\"54\"},{\"x\":115,\"y\":403,\"pos\":\"55\"},{\"x\":115,\"y\":403,\"pos\":\"56\"},{\"x\":114,\"y\":404,\"pos\":\"57\"},{\"x\":114,\"y\":404,\"pos\":\"58\"},{\"x\":113,\"y\":405,\"pos\":\"59\"},{\"x\":112,\"y\":405,\"pos\":\"60\"},{\"x\":112,\"y\":406,\"pos\":\"61\"},{\"x\":112,\"y\":407,\"pos\":\"62\"},{\"x\":111,\"y\":407,\"pos\":\"63\"}],\"id\":\"165\",\"length\":\"44.577\"},{\"points\":[{\"x\":251,\"y\":285,\"pos\":\"1\"},{\"x\":250,\"y\":285,\"pos\":\"2\"},{\"x\":249,\"y\":285,\"pos\":\"3\"},{\"x\":248,\"y\":286,\"pos\":\"4\"},{\"x\":247,\"y\":286,\"pos\":\"5\"},{\"x\":246,\"y\":286,\"pos\":\"6\"},{\"x\":246,\"y\":287,\"pos\":\"7\"},{\"x\":245,\"y\":287,\"pos\":\"8\"},{\"x\":244,\"y\":288,\"pos\":\"9\"},{\"x\":244,\"y\":288,\"pos\":\"10\"},{\"x\":243,\"y\":288,\"pos\":\"11\"},{\"x\":243,\"y\":289,\"pos\":\"12\"},{\"x\":242,\"y\":289,\"pos\":\"13\"},{\"x\":242,\"y\":290,\"pos\":\"14\"},{\"x\":241,\"y\":290,\"pos\":\"15\"},{\"x\":241,\"y\":291,\"pos\":\"16\"},{\"x\":240,\"y\":291,\"pos\":\"17\"},{\"x\":239,\"y\":292,\"pos\":\"18\"},{\"x\":239,\"y\":292,\"pos\":\"19\"},{\"x\":238,\"y\":292,\"pos\":\"20\"},{\"x\":238,\"y\":293,\"pos\":\"21\"},{\"x\":237,\"y\":293,\"pos\":\"22\"},{\"x\":237,\"y\":294,\"pos\":\"23\"},{\"x\":236,\"y\":294,\"pos\":\"24\"},{\"x\":236,\"y\":295,\"pos\":\"25\"},{\"x\":235,\"y\":295,\"pos\":\"26\"}],\"id\":\"168\",\"length\":\"19.169\"},{\"points\":[{\"x\":574,\"y\":144,\"pos\":\"1\"},{\"x\":573,\"y\":144,\"pos\":\"2\"},{\"x\":572,\"y\":144,\"pos\":\"3\"},{\"x\":571,\"y\":144,\"pos\":\"4\"},{\"x\":570,\"y\":144,\"pos\":\"5\"},{\"x\":569,\"y\":144,\"pos\":\"6\"},{\"x\":568,\"y\":144,\"pos\":\"7\"},{\"x\":567,\"y\":144,\"pos\":\"8\"},{\"x\":566,\"y\":145,\"pos\":\"9\"},{\"x\":565,\"y\":145,\"pos\":\"10\"},{\"x\":564,\"y\":145,\"pos\":\"11\"},{\"x\":563,\"y\":145,\"pos\":\"12\"},{\"x\":562,\"y\":146,\"pos\":\"13\"},{\"x\":561,\"y\":146,\"pos\":\"14\"},{\"x\":560,\"y\":146,\"pos\":\"15\"},{\"x\":559,\"y\":146,\"pos\":\"16\"},{\"x\":558,\"y\":146,\"pos\":\"17\"},{\"x\":557,\"y\":146,\"pos\":\"18\"},{\"x\":556,\"y\":146,\"pos\":\"19\"},{\"x\":555,\"y\":146,\"pos\":\"20\"},{\"x\":554,\"y\":147,\"pos\":\"21\"},{\"x\":553,\"y\":147,\"pos\":\"22\"},{\"x\":552,\"y\":147,\"pos\":\"23\"},{\"x\":551,\"y\":147,\"pos\":\"24\"},{\"x\":550,\"y\":147,\"pos\":\"25\"},{\"x\":549,\"y\":147,\"pos\":\"26\"},{\"x\":548,\"y\":147,\"pos\":\"27\"},{\"x\":547,\"y\":147,\"pos\":\"28\"},{\"x\":546,\"y\":147,\"pos\":\"29\"},{\"x\":545,\"y\":147,\"pos\":\"30\"},{\"x\":544,\"y\":147,\"pos\":\"31\"},{\"x\":543,\"y\":147,\"pos\":\"32\"},{\"x\":542,\"y\":147,\"pos\":\"33\"},{\"x\":541,\"y\":147,\"pos\":\"34\"},{\"x\":540,\"y\":148,\"pos\":\"35\"},{\"x\":539,\"y\":148,\"pos\":\"36\"},{\"x\":538,\"y\":148,\"pos\":\"37\"},{\"x\":537,\"y\":148,\"pos\":\"38\"},{\"x\":536,\"y\":148,\"pos\":\"39\"},{\"x\":535,\"y\":148,\"pos\":\"40\"},{\"x\":534,\"y\":148,\"pos\":\"41\"},{\"x\":533,\"y\":148,\"pos\":\"42\"},{\"x\":532,\"y\":147,\"pos\":\"43\"},{\"x\":531,\"y\":147,\"pos\":\"44\"},{\"x\":530,\"y\":147,\"pos\":\"45\"},{\"x\":529,\"y\":147,\"pos\":\"46\"},{\"x\":528,\"y\":147,\"pos\":\"47\"},{\"x\":527,\"y\":147,\"pos\":\"48\"}],\"id\":\"170\",\"length\":\"47.308\"},{\"points\":[{\"x\":527,\"y\":147,\"pos\":\"1\"},{\"x\":526,\"y\":147,\"pos\":\"2\"},{\"x\":526,\"y\":146,\"pos\":\"3\"},{\"x\":525,\"y\":146,\"pos\":\"4\"},{\"x\":524,\"y\":146,\"pos\":\"5\"},{\"x\":523,\"y\":146,\"pos\":\"6\"},{\"x\":522,\"y\":145,\"pos\":\"7\"},{\"x\":521,\"y\":145,\"pos\":\"8\"},{\"x\":520,\"y\":145,\"pos\":\"9\"},{\"x\":519,\"y\":145,\"pos\":\"10\"},{\"x\":518,\"y\":145,\"pos\":\"11\"},{\"x\":517,\"y\":145,\"pos\":\"12\"},{\"x\":516,\"y\":145,\"pos\":\"13\"},{\"x\":515,\"y\":145,\"pos\":\"14\"},{\"x\":514,\"y\":145,\"pos\":\"15\"},{\"x\":513,\"y\":145,\"pos\":\"16\"},{\"x\":512,\"y\":146,\"pos\":\"17\"},{\"x\":511,\"y\":146,\"pos\":\"18\"},{\"x\":510,\"y\":147,\"pos\":\"19\"},{\"x\":510,\"y\":147,\"pos\":\"20\"},{\"x\":509,\"y\":147,\"pos\":\"21\"},{\"x\":509,\"y\":148,\"pos\":\"22\"},{\"x\":508,\"y\":148,\"pos\":\"23\"},{\"x\":508,\"y\":149,\"pos\":\"24\"},{\"x\":507,\"y\":150,\"pos\":\"25\"},{\"x\":507,\"y\":151,\"pos\":\"26\"},{\"x\":507,\"y\":152,\"pos\":\"27\"},{\"x\":506,\"y\":153,\"pos\":\"28\"},{\"x\":506,\"y\":154,\"pos\":\"29\"}],\"id\":\"171\",\"length\":\"26.093\"},{\"points\":[{\"x\":506,\"y\":154,\"pos\":\"1\"},{\"x\":505,\"y\":155,\"pos\":\"2\"},{\"x\":505,\"y\":155,\"pos\":\"3\"},{\"x\":504,\"y\":155,\"pos\":\"4\"},{\"x\":504,\"y\":156,\"pos\":\"5\"},{\"x\":503,\"y\":156,\"pos\":\"6\"},{\"x\":502,\"y\":156,\"pos\":\"7\"},{\"x\":502,\"y\":157,\"pos\":\"8\"},{\"x\":501,\"y\":157,\"pos\":\"9\"},{\"x\":500,\"y\":157,\"pos\":\"10\"},{\"x\":499,\"y\":158,\"pos\":\"11\"},{\"x\":498,\"y\":158,\"pos\":\"12\"},{\"x\":497,\"y\":158,\"pos\":\"13\"},{\"x\":496,\"y\":159,\"pos\":\"14\"},{\"x\":495,\"y\":159,\"pos\":\"15\"},{\"x\":494,\"y\":159,\"pos\":\"16\"},{\"x\":493,\"y\":159,\"pos\":\"17\"},{\"x\":492,\"y\":159,\"pos\":\"18\"},{\"x\":491,\"y\":159,\"pos\":\"19\"},{\"x\":490,\"y\":159,\"pos\":\"20\"},{\"x\":489,\"y\":160,\"pos\":\"21\"},{\"x\":488,\"y\":160,\"pos\":\"22\"},{\"x\":487,\"y\":160,\"pos\":\"23\"},{\"x\":486,\"y\":160,\"pos\":\"24\"},{\"x\":485,\"y\":161,\"pos\":\"25\"},{\"x\":484,\"y\":161,\"pos\":\"26\"},{\"x\":483,\"y\":161,\"pos\":\"27\"},{\"x\":482,\"y\":161,\"pos\":\"28\"},{\"x\":481,\"y\":162,\"pos\":\"29\"},{\"x\":480,\"y\":162,\"pos\":\"30\"},{\"x\":479,\"y\":162,\"pos\":\"31\"},{\"x\":478,\"y\":163,\"pos\":\"32\"},{\"x\":477,\"y\":163,\"pos\":\"33\"},{\"x\":476,\"y\":163,\"pos\":\"34\"},{\"x\":475,\"y\":164,\"pos\":\"35\"},{\"x\":474,\"y\":164,\"pos\":\"36\"},{\"x\":473,\"y\":164,\"pos\":\"37\"},{\"x\":472,\"y\":164,\"pos\":\"38\"},{\"x\":471,\"y\":164,\"pos\":\"39\"},{\"x\":470,\"y\":165,\"pos\":\"40\"},{\"x\":469,\"y\":165,\"pos\":\"41\"},{\"x\":468,\"y\":165,\"pos\":\"42\"},{\"x\":467,\"y\":164,\"pos\":\"43\"},{\"x\":466,\"y\":164,\"pos\":\"44\"}],\"id\":\"172\",\"length\":\"41.960\"},{\"points\":[{\"x\":466,\"y\":164,\"pos\":\"1\"},{\"x\":465,\"y\":164,\"pos\":\"2\"},{\"x\":465,\"y\":163,\"pos\":\"3\"},{\"x\":464,\"y\":163,\"pos\":\"4\"},{\"x\":464,\"y\":162,\"pos\":\"5\"},{\"x\":463,\"y\":162,\"pos\":\"6\"},{\"x\":463,\"y\":162,\"pos\":\"7\"},{\"x\":462,\"y\":161,\"pos\":\"8\"},{\"x\":461,\"y\":161,\"pos\":\"9\"},{\"x\":460,\"y\":160,\"pos\":\"10\"},{\"x\":459,\"y\":160,\"pos\":\"11\"},{\"x\":458,\"y\":160,\"pos\":\"12\"},{\"x\":457,\"y\":160,\"pos\":\"13\"},{\"x\":456,\"y\":160,\"pos\":\"14\"},{\"x\":455,\"y\":160,\"pos\":\"15\"},{\"x\":454,\"y\":161,\"pos\":\"16\"},{\"x\":453,\"y\":161,\"pos\":\"17\"},{\"x\":453,\"y\":161,\"pos\":\"18\"},{\"x\":452,\"y\":162,\"pos\":\"19\"},{\"x\":451,\"y\":162,\"pos\":\"20\"},{\"x\":451,\"y\":162,\"pos\":\"21\"},{\"x\":450,\"y\":163,\"pos\":\"22\"},{\"x\":449,\"y\":163,\"pos\":\"23\"},{\"x\":449,\"y\":164,\"pos\":\"24\"},{\"x\":448,\"y\":164,\"pos\":\"25\"},{\"x\":447,\"y\":164,\"pos\":\"26\"},{\"x\":447,\"y\":165,\"pos\":\"27\"},{\"x\":446,\"y\":165,\"pos\":\"28\"},{\"x\":446,\"y\":166,\"pos\":\"29\"},{\"x\":445,\"y\":166,\"pos\":\"30\"},{\"x\":445,\"y\":166,\"pos\":\"31\"}],\"id\":\"173\",\"length\":\"23.931\"},{\"points\":[{\"x\":445,\"y\":166,\"pos\":\"1\"},{\"x\":444,\"y\":166,\"pos\":\"2\"},{\"x\":443,\"y\":166,\"pos\":\"3\"},{\"x\":442,\"y\":166,\"pos\":\"4\"},{\"x\":441,\"y\":166,\"pos\":\"5\"},{\"x\":440,\"y\":167,\"pos\":\"6\"},{\"x\":439,\"y\":167,\"pos\":\"7\"},{\"x\":438,\"y\":167,\"pos\":\"8\"},{\"x\":437,\"y\":167,\"pos\":\"9\"},{\"x\":436,\"y\":167,\"pos\":\"10\"},{\"x\":435,\"y\":167,\"pos\":\"11\"},{\"x\":434,\"y\":168,\"pos\":\"12\"},{\"x\":433,\"y\":168,\"pos\":\"13\"},{\"x\":432,\"y\":168,\"pos\":\"14\"},{\"x\":431,\"y\":169,\"pos\":\"15\"},{\"x\":430,\"y\":169,\"pos\":\"16\"},{\"x\":429,\"y\":170,\"pos\":\"17\"},{\"x\":428,\"y\":170,\"pos\":\"18\"},{\"x\":427,\"y\":170,\"pos\":\"19\"},{\"x\":426,\"y\":171,\"pos\":\"20\"},{\"x\":425,\"y\":171,\"pos\":\"21\"},{\"x\":424,\"y\":172,\"pos\":\"22\"},{\"x\":424,\"y\":172,\"pos\":\"23\"},{\"x\":423,\"y\":172,\"pos\":\"24\"},{\"x\":422,\"y\":173,\"pos\":\"25\"},{\"x\":422,\"y\":173,\"pos\":\"26\"},{\"x\":421,\"y\":173,\"pos\":\"27\"},{\"x\":420,\"y\":174,\"pos\":\"28\"},{\"x\":420,\"y\":174,\"pos\":\"29\"},{\"x\":419,\"y\":174,\"pos\":\"30\"},{\"x\":418,\"y\":175,\"pos\":\"31\"},{\"x\":418,\"y\":175,\"pos\":\"32\"},{\"x\":417,\"y\":175,\"pos\":\"33\"},{\"x\":417,\"y\":176,\"pos\":\"34\"},{\"x\":416,\"y\":176,\"pos\":\"35\"},{\"x\":416,\"y\":177,\"pos\":\"36\"},{\"x\":415,\"y\":177,\"pos\":\"37\"},{\"x\":415,\"y\":178,\"pos\":\"38\"},{\"x\":415,\"y\":178,\"pos\":\"39\"},{\"x\":414,\"y\":179,\"pos\":\"40\"},{\"x\":414,\"y\":180,\"pos\":\"41\"},{\"x\":414,\"y\":181,\"pos\":\"42\"},{\"x\":414,\"y\":182,\"pos\":\"43\"},{\"x\":413,\"y\":183,\"pos\":\"44\"}],\"id\":\"174\",\"length\":\"38.864\"},{\"points\":[{\"x\":413,\"y\":183,\"pos\":\"1\"},{\"x\":413,\"y\":184,\"pos\":\"2\"},{\"x\":413,\"y\":184,\"pos\":\"3\"},{\"x\":412,\"y\":185,\"pos\":\"4\"},{\"x\":411,\"y\":185,\"pos\":\"5\"},{\"x\":411,\"y\":186,\"pos\":\"6\"},{\"x\":410,\"y\":186,\"pos\":\"7\"},{\"x\":410,\"y\":186,\"pos\":\"8\"},{\"x\":409,\"y\":187,\"pos\":\"9\"},{\"x\":408,\"y\":187,\"pos\":\"10\"},{\"x\":408,\"y\":188,\"pos\":\"11\"},{\"x\":407,\"y\":188,\"pos\":\"12\"},{\"x\":406,\"y\":189,\"pos\":\"13\"},{\"x\":406,\"y\":189,\"pos\":\"14\"},{\"x\":405,\"y\":189,\"pos\":\"15\"},{\"x\":405,\"y\":190,\"pos\":\"16\"},{\"x\":404,\"y\":190,\"pos\":\"17\"},{\"x\":403,\"y\":191,\"pos\":\"18\"},{\"x\":403,\"y\":191,\"pos\":\"19\"},{\"x\":402,\"y\":191,\"pos\":\"20\"},{\"x\":402,\"y\":192,\"pos\":\"21\"},{\"x\":401,\"y\":192,\"pos\":\"22\"},{\"x\":400,\"y\":192,\"pos\":\"23\"},{\"x\":400,\"y\":193,\"pos\":\"24\"},{\"x\":399,\"y\":193,\"pos\":\"25\"},{\"x\":398,\"y\":193,\"pos\":\"26\"},{\"x\":398,\"y\":193,\"pos\":\"27\"},{\"x\":397,\"y\":194,\"pos\":\"28\"},{\"x\":396,\"y\":194,\"pos\":\"29\"},{\"x\":396,\"y\":194,\"pos\":\"30\"},{\"x\":395,\"y\":195,\"pos\":\"31\"},{\"x\":394,\"y\":195,\"pos\":\"32\"},{\"x\":394,\"y\":195,\"pos\":\"33\"},{\"x\":393,\"y\":196,\"pos\":\"34\"},{\"x\":392,\"y\":196,\"pos\":\"35\"},{\"x\":392,\"y\":196,\"pos\":\"36\"},{\"x\":391,\"y\":197,\"pos\":\"37\"},{\"x\":390,\"y\":197,\"pos\":\"38\"},{\"x\":390,\"y\":198,\"pos\":\"39\"},{\"x\":389,\"y\":198,\"pos\":\"40\"},{\"x\":389,\"y\":198,\"pos\":\"41\"},{\"x\":388,\"y\":199,\"pos\":\"42\"},{\"x\":387,\"y\":199,\"pos\":\"43\"},{\"x\":387,\"y\":200,\"pos\":\"44\"},{\"x\":386,\"y\":200,\"pos\":\"45\"},{\"x\":385,\"y\":200,\"pos\":\"46\"},{\"x\":385,\"y\":201,\"pos\":\"47\"},{\"x\":384,\"y\":201,\"pos\":\"48\"},{\"x\":383,\"y\":202,\"pos\":\"49\"},{\"x\":383,\"y\":202,\"pos\":\"50\"},{\"x\":382,\"y\":202,\"pos\":\"51\"},{\"x\":382,\"y\":202,\"pos\":\"52\"},{\"x\":381,\"y\":203,\"pos\":\"53\"},{\"x\":380,\"y\":203,\"pos\":\"54\"},{\"x\":380,\"y\":204,\"pos\":\"55\"},{\"x\":379,\"y\":204,\"pos\":\"56\"},{\"x\":378,\"y\":204,\"pos\":\"57\"},{\"x\":377,\"y\":205,\"pos\":\"58\"},{\"x\":376,\"y\":205,\"pos\":\"59\"},{\"x\":375,\"y\":205,\"pos\":\"60\"},{\"x\":374,\"y\":206,\"pos\":\"61\"},{\"x\":373,\"y\":206,\"pos\":\"62\"},{\"x\":372,\"y\":206,\"pos\":\"63\"}],\"id\":\"175\",\"length\":\"47.770\"}],\"distance\":[0,0,0,0,0,0,0,0,0,0,0,0,0]}";

        const s = JSON.parse(test);
        const sortedLines = new DistancePointContainer();

        for (let p of s.lines) {
          const pp = new PointLine();
          pp.id = p.id;
          pp.length = p.length;
          pp.points = p.points;
          sortedLines.addLine(pp, 0);
        }

        sortedLines.lines.reverse()

        if (sortedLines instanceof DistancePointContainer && sortedLines.hasLines()) {
          // if (true) {
          console.log("Preparing Host");

          for (let i = 0; i < sortedLines.getLines().length; i++) {
            const p = new PointLine();
            const line = sortedLines.getLine(i);
            p.id = line.id;
            p.length = line.length;

            p.addPoint(line.getFirstPoint());

            for (let y = 1; y < line.points.length; y = y + 10) {
              if (p.getLastPoint().x != line.points[y].x) {
                p.addPoint(line.points[y])
              }
            }

            if (p.getLastPoint().x != line.getLastPoint().x) {
              p.addPoint(line.getLastPoint())
            }
            sortedLines.setLine(i, p);
          }


          const centerPoint = 675;
          const maxPointThreashold = 50
          let top = 0;
          let count = 0;
          let topPoint = new Point(675, 200)
          for (let line of sortedLines.getLines()) {

            if ((line.getFirstPoint().x < centerPoint && line.getLastPoint().x > centerPoint) || (line.getFirstPoint().x > centerPoint && line.getLastPoint().x < centerPoint)) {
              for (let point of line.points) {
                if (point.x > centerPoint - 100 && point.x < centerPoint + 100) {
                  if (point.y < topPoint.y) {
                    top += point.y;
                    count++;
                  }
                }
              }

            }
          }

          topPoint.y = top / count - 10;

          let c = 0;
          for (let line of sortedLines.getLines()) {

            const mid = Math.floor(line.points.length / 2);

            if (line.points.length > mid) {
              const lineCenter = line.points[mid];
              DrawUtil.text(canvas, `Line (${c}) ${line.id}`, new Point(lineCenter.x + 5, lineCenter.y + 5), "16px Arial", "DarkOrange")
            } else if (line.length > 0) {
              DrawUtil.text(canvas, `Line (${c}) ${line.id}`, new Point(line.points[0].x + 5, line.points[0].y + 5), "16px Arial", "DarkOrange")
            }
            c++;
          }

          console.log("-----------------")
          console.log(topPoint)
          console.log("-----------------")

          for (let x = 0; x < 1351; x++) {
            let y = 0.001 * Math.pow(x - topPoint.x, 2) + topPoint.y;
            DrawUtil.drawPoint(canvas, new Point(x, y))
          }


          const joinAll = function (lines: PointLine[], maxDistance: number): PointLine[] {
            const result: PointLine[] = [];

            sortLines(lines);

            while (lines.length != 0) {
              console.log(`-> Start Elemts ${lines.length} Results ${result.length}`)
              const res = join(lines.pop(), lines, maxDistance, 0);
              result.push(res[0]);
              lines = res[1];

              console.log(`-> End Elemts ${lines.length} Results ${result.length}`)
            }

            console.log(result);
            return result;
          };


          const sortLines = function (lines: PointLine[]) {
            for (let l of lines) {
              if (l.getFirstPoint().x > l.getLastPoint().x)
                l.points.reverse()
            }
          };

          const joinLines = function (firstLine: PointLine, secondLine: PointLine, secondLinePosition: Direction) {
            if (secondLinePosition === Direction.FirstPoint) {
              return [...firstLine.points, ...secondLine.points];
            } else {
              return [...secondLine.points, ...firstLine.points];
            }
          }

          const joinDir = function (firstLine: PointLine, secondLine: PointLine, secondLinePosition: Direction): Point {
            if (secondLinePosition === Direction.FirstPoint) {
              return VectorUtils.directionVector(firstLine.getLastPoint(), secondLine.getFirstPoint())
            } else {
              return VectorUtils.directionVector(secondLine.getLastPoint(), firstLine.getFirstPoint())
            }
          }

          const join = function (firstLine: PointLine, lines: PointLine[], maxDistance: number, depth: number): [PointLine, Array<PointLine>] {

            console.log("Recusive " + depth)
            const nearestLines: shortestDistance[] = []


            for (let l2 of lines) {

              let tmp: shortestDistance = null;

              let dist = VectorUtils.distance(firstLine.getFirstPoint(), l2.getFirstPoint());

              // console.log(`Distance ${dist}  ${firstLine.id} ${l2.id} - First - First`)
              if (dist < maxDistance && (tmp === null || dist < tmp.distance)) {
                tmp = new shortestDistance();
                tmp.distance = dist;
                tmp.firstLine = Direction.FirstPoint;
                tmp.secondLine = Direction.FirstPoint;
                tmp.line = l2;
              }

              dist = VectorUtils.distance(firstLine.getFirstPoint(), l2.getLastPoint());
              // console.log(`Distance ${dist}  ${firstLine.id} ${l2.id} - First - Last`)
              if (dist < maxDistance && (tmp === null || dist < tmp.distance)) {
                tmp = new shortestDistance();
                tmp.distance = dist;
                tmp.firstLine = Direction.FirstPoint;
                tmp.secondLine = Direction.LastPoint;
                tmp.line = l2;
              }

              dist = VectorUtils.distance(firstLine.getLastPoint(), l2.getFirstPoint());
              // console.log(`Distance ${dist}  ${firstLine.id} ${l2.id} - Last - First`)
              if (dist < maxDistance && (tmp === null || dist < tmp.distance)) {
                tmp = new shortestDistance();
                tmp.distance = dist;
                tmp.firstLine = Direction.LastPoint;
                tmp.secondLine = Direction.FirstPoint;
                tmp.line = l2;
              }

              dist = VectorUtils.distance(firstLine.getLastPoint(), l2.getLastPoint());
              // console.log(`Distance ${dist}  ${firstLine.id} ${l2.id} - Last - Last`)
              if (dist < maxDistance && (tmp === null || dist < tmp.distance)) {
                tmp = new shortestDistance();
                tmp.distance = dist;
                tmp.firstLine = Direction.LastPoint;
                tmp.secondLine = Direction.LastPoint;
                tmp.line = l2;
              }

              if (tmp != null) {
                nearestLines.push(tmp);
                console.log("Pushing")
                console.log(tmp)
              }


              // console.log("--")
            }

            if (nearestLines.length > 0) {

              console.log("Two Ways")
              let result = null;

              for (let nearestLine of nearestLines) {

                console.log("Line" + firstLine.id + " / " + nearestLine.line.id);
                const joinVector = joinDir(firstLine, nearestLine.line, nearestLine.secondLine);

                console.log()
                console.log("-----" + VectorUtils.angle(VectorUtils.reducedDirectionVector(firstLine), VectorUtils.reducedDirectionVector(nearestLine.line)))

                const join1 = VectorUtils.angle(VectorUtils.reducedDirectionVector(firstLine), joinVector);
                const join2 = VectorUtils.angle(VectorUtils.reducedDirectionVector(nearestLine.line), joinVector);

                console.log("----1 " + join1)
                console.log("----2 " + join2)

                if (join2 < 0.5 || join1 < 0.5)
                  continue;

                const newline = new PointLine();
                newline.id = firstLine.id + "-" + nearestLine.line.id;
                newline.length = firstLine.length + nearestLine.line.length;
                newline.points = joinLines(firstLine, nearestLine.line, nearestLine.secondLine);

                const clonedLines = Object.assign([], lines);

                for (let line of clonedLines) {
                  if (line.id === nearestLine.line.id) {
                    const index = lines.indexOf(line)
                    if (index !== -1) {
                      console.log("Removing second line")
                      clonedLines.splice(index, 1);
                    }
                  }
                }

                console.log("Calling rec with " + newline.id)
                const recLine = join(newline, clonedLines, maxDistance, depth + 1);
                if (result == null || recLine.length > result.length) {
                  result = recLine;
                }
              }

              console.log("!!!!!")
              console.log(result)
              if (result == null)
                return [firstLine, lines];
              else
                return result;

            }

            return [firstLine, lines];


            // for (let i = 0; i < res.length; i++) {
            //   console.log(VectorUtils.angle(VectorUtils.reducedDirectionVector(l1), VectorUtils.reducedDirectionVector(res[i].line)))
            //   console.log(`Length ${res[i].line.id} ${res[i].line.length}`)
            //
            //   if(i === 1 )
            //     res[i].line.length =1000
            //
            //   console.log(`Length ${i} ${res[i].line.id} ${res[i].line.length}`)
            //
            //   if (l2 === null || res[i].line.length > l2.line.length) {
            //     l2 = res[i];
            //
            //   }
            // }


            // if (l2 !== null) {
            //
            //   console.log(`Join LInes ${l1.id} and ${l2.line.id}`)
            //
            //   DrawUtil.drawPointLineOnCanvas(canvas, new Point(l1.getFirstPoint().x, l1.getFirstPoint().y), new Point(l1.getFirstPoint().x, l1.getFirstPoint().y - 20), "yellow", 1, false)
            //   DrawUtil.drawPointLineOnCanvas(canvas, new Point(l1.getLastPoint().x, l1.getLastPoint().y), new Point(l1.getLastPoint().x, l1.getLastPoint().y + 20), "red", 1, false)
            //
            //   DrawUtil.drawPointLineOnCanvas(canvas, new Point(l2.line.getFirstPoint().x + 2, l2.line.getFirstPoint().y), new Point(l2.line.getFirstPoint().x + 2, l2.line.getFirstPoint().y - 20), "yellow", 1, false)
            //   DrawUtil.drawPointLineOnCanvas(canvas, new Point(l2.line.getLastPoint().x + 2, l2.line.getLastPoint().y), new Point(l2.line.getLastPoint().x + 2, l2.line.getLastPoint().y + 20), "red", 1, false)
            //
            //
            //   if (l2.secondLine === Direction.FirstPoint) {
            //     DrawUtil.drawPoint(canvas, new Point(l1.getLastPoint().x, l1.getLastPoint().y), "YellowGreen", 8)
            //     l1.points = [...l1.points, ...l2.line.points];
            //   } else {
            //     DrawUtil.drawPoint(canvas, new Point(l1.getFirstPoint().x, l1.getFirstPoint().y), "YellowGreen", 8)
            //     l1.points = [...l2.line.points, ...l1.points];
            //     l1.id += " " + l2.line.id
            //   }
            //
            //   const index = lines.indexOf(l2.line)
            //
            //   if (index !== -1)
            //     lines.splice(index, 1);
            //
            //   return true;
            // }
          };

          enum Direction {
            FirstPoint, LastPoint
          }

          class shortestDistance {
            distance = Math.max();
            line: PointLine;
            firstLine = Direction.FirstPoint;
            secondLine = Direction.FirstPoint;
          };

          sortedLines.lines = joinAll(sortedLines.getLines(), 25);

          const equation = `(-500/(x - ${topPoint.x}))*(%p.x%-x)+(0.001*(x-${topPoint.x})*(x-${topPoint.x})+${topPoint.y})`;

          data.setData(new HostData(equation, topPoint), "hostData")
          let i = 0;
          for (let line of sortedLines.getLines()) {

            const result: number[] = [];

            for (let p of line.points) {
              //const equation = `(-500/(x - ${topPoint.x}))*(${p.x}-x)+(0.001*(x-${topPoint.x})*(x-${topPoint.x})+${topPoint.y})`;
              const eq = equation.replace("%p.x%", String(p.x));
              //console.log("P1 " + p.x + " " + p.y)
              //console.log(equation)

              try {
                var n1 = parse(eq);
                var quad = new Equation(n1, p.y);

                var answers = quad.solveFor("x");

                let y = 0.001 * Math.pow(answers - topPoint.x, 2) + topPoint.y;

                //console.log("x: " + answers + " y: " + y)

                DrawUtil.drawPointLineOnCanvas(canvas, p, new Point(answers, y), 'red');

                const r = VectorUtils.distance(p, new Point(answers, y))

                result.push(r);
              } catch (e) {
                console.error("error");
              }
            }

            const mean = VectorUtils.mean(result);
            if (mean < 30)
              DrawUtil.drawPointLinesOnCanvas(canvas, line.points, CImageUtil.colors[i + 1], 2);
            else
              DrawUtil.drawPointLinesOnCanvas(canvas, line.points, "red", 3)
            i++;
          }

          data.img.data = DrawUtil.canvasAsBase64(canvas);
        }
        return data;
      }))
    );
  }

  public drawGraft(sourceName: string = "lines") {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(data.img.data).pipe(map(canvas => {

        const lines = data.getData(sourceName);
        const hostData = data.getData("hostData");

        if (lines instanceof DistancePointContainer && lines.hasLines() && hostData instanceof HostData) {
          let i = 0;
          for (let line of lines.getLines()) {

            const result: number[] = [];
            const points: Point[][] = [];

            for (let p of line.points) {
              //const equation = `(-500/(x - ${topPoint.x}))*(${p.x}-x)+(0.001*(x-${topPoint.x})*(x-${topPoint.x})+${topPoint.y})`;
              const eq = hostData.formula.replace("%p.x%", String(p.x));
              //console.log("P1 " + p.x + " " + p.y)
              //console.log(equation)

              try {
                var n1 = parse(eq);
                var quad = new Equation(n1, p.y);

                var answers = Math.round(quad.solveFor("x"));

                let y = Math.round(0.001 * Math.pow(answers - hostData.topPosition.x, 2) + hostData.topPosition.y);

                //console.log("x: " + answers + " y: " + y)

                DrawUtil.drawPointLineOnCanvas(canvas, p, new Point(answers, y), 'green');
                const linePoint = new Point(answers, y);
                const r = VectorUtils.distance(p, new Point(answers, y))

                points.push([p, linePoint])

                result.push(r);
              } catch (e) {
                console.error("error");
              }
            }

            const mean = VectorUtils.mean(result);
            const dir = points.map(x => VectorUtils.directionVector(x[0], x[1]));
            const dirY = VectorUtils.mean(dir.map(x => x.y));

            console.log("Dir -----------------")
            console.log(`Dir ${dir[0].x}/${dir[0].y}`);
            console.log(`Dir ${dirY}`);

            DrawUtil.text(canvas, `Line ${i}`, new Point(points[0][0].x, points[0][0].y), "8px Arial", "yellow")
            DrawUtil.text(canvas, `Dist ${mean}`, new Point(points[0][0].x, points[0][0].y + 10), "8px Arial", "yellow")
            DrawUtil.text(canvas, `${Math.round(dir[0].x)} / ${Math.round(dir[0].y)}`, new Point(points[0][0].x, points[0][0].y + 20), "8px Arial", "yellow")
            DrawUtil.text(canvas, `P ${points[0][0].x}/${points[0][0].y} - ${points[0][1].x}/${points[0][1].y}`, new Point(points[0][0].x, points[0][0].y + 30), "8px Arial", "yellow")

            if (dirY < -10) {
              DrawUtil.drawPointLinesOnCanvas(canvas, line.points, "red", 3)
              DrawUtil.text(canvas, `Out`, new Point(points[0][0].x, points[0][0].y + 40), "8px Arial", "red")
            }


            if (mean < 50)
              DrawUtil.drawPointLinesOnCanvas(canvas, line.points, CImageUtil.colors[i + 1], 2);
            else {
              DrawUtil.drawPointLinesOnCanvas(canvas, line.points, "red", 3)
            }


            i++;
          }
        }

        data.img.data = DrawUtil.canvasAsBase64(canvas);
        return data;
      }))
    );
  }

  /**
   * 0 = grey, 2 = color
   */
  public toColorType(colorType: ColorType) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
        let buff = new Buffer(data.img.data, 'base64');
        let png = PNG.sync.read(buff);
        let buffer = PNG.sync.write(png, {colorType: colorType});
        data.img.data = buffer.toString('base64');
        observer.next(data);
        observer.complete();
      }
    ));
  }


  public color(color: string, x = 0, y = 0, height: number = -1, width: number = -1) {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(data.img.data).pipe(
      map(canvas => {
        console.log(`Color img ${color}`);

        height = height < 0 ? canvas.height - y : height;
        width = width < 0 ? canvas.width - x : width;

        DrawUtil.drawRect(canvas, x, y, width, height, color);
        data.img.data = DrawUtil.canvasAsBase64(canvas);

        return data;
      })));
  }


  public prepareClasses(color: boolean = false) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {

        let buff = new Buffer(data.img.data, 'base64');
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
        data.img.data = buffer.toString('base64');
        observer.next(data);
        observer.complete();
      }
    ));
  }

  // public checkXProgression(color: string) {
  //   return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(data.getImg().data).pipe(map(canvas => {
  //     if (data.additionalData != null) {
  //       console.log("X Progression");
  //
  //       let lastX = 0;
  //       for (let i = 0; i < data.additionalData.length; i++) {
  //         for (let y = 0; y < data.additionalData[i].points; y++) {
  //
  //           if (lastX < data.additionalData[i].points[y].x) {
  //             console.error("Double Point");
  //           }
  //
  //           DrawUtil.drawPoint(canvas, data.additionalData[i].points[y], color, 2);
  //         }
  //       }
  //       return data;
  //     }
  //   })));
  // }

  public layer(layerID: string, color: string, size: number, drawPoints: boolean) {
    return flatMap((data: FilterData) => new Observable<Layer>((observer) => {
        let layer = null;
        for (let tmp of data.img.layers) {
          if (tmp.id == layerID) {
            layer = tmp;
            break;
          }
        }
        observer.next(layer);
        observer.complete();
      }).pipe(flatMap(layer => DrawUtil.loadBase64AsCanvas(data.img.data).pipe(map(canvas => {
        if (layer != null) {
          DrawUtil.drawManyPointLinesOnCanvas(canvas, layer.lines, color, size, drawPoints);
          data.img.data = DrawUtil.canvasAsBase64(canvas);
          console.log('layer img' + data.origName + ' ' + layer.id + ' ' + color);
        }
        return data;
      }))))
    );
  }

  public magic(command: string) {
    return flatMap((data: FilterData) =>
      this.imageMagicService.performMagic(data.img, command).pipe(
        map(cimg => {
            data.img = cimg;
            return data;
          }
        )
      )
    );
  }

  public cubicSpline(sourceName: string = "sortedLines") {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(data.img.data).pipe(map(canvas => {

        const sortedLines = data.getData(sourceName);

        if (sortedLines instanceof DistancePointContainer) {
          console.log("Cubic spline ")

          const Spline = require('cubic-spline');
          const lines = sortedLines.getLines();

          const xs: number[][] = [];
          const ys: number[][] = [];
          xs.push([]);
          ys.push([]);
          let index = 0;

          lines.forEach(line => {
            line.points.forEach(point => {
              if (xs[index].length == 0 || xs[index][xs[index].length - 1] != point.x) {
                xs[index].push(point.x);
                ys[index].push(point.y);
              } else {
                console.log("Skipping double points")
              }
            });

            if (sortedLines.getDistanceToNextLine(sortedLines.getIndexOfLine(line)) == -1) {
              // reversing
              if (xs[index][0] > xs[index][xs[index].length - 1]) {
                console.log("reverse line!")
                xs[index].reverse();
                xs[index].reverse();
              }

              xs.push([]);
              ys.push([]);
              index++;
            }
          });

          const cx = canvas.getContext('2d');
          cx.strokeStyle = "green";
          cx.fillStyle = "green"
          cx.lineWidth = 1;

          for (let i = 0; i < xs.length; i++) {
            // new a Spline object
            let spline = new Spline(xs[i], ys[i]);

            const start = xs[i][0];

            for (let i = start; i < 1300; i++) {
              const c = spline.at(i)
              if (!isNaN(c)) {
                cx.fillRect(i, c, 2, 2);
                console.log("draw Point at " + i)
              }
            }
          }

          data.img.data = DrawUtil.canvasAsBase64(canvas);
        }
        return data;
      }))
    );
  }

  public spline({tension = 0.5, lineColor = "#00FF00", size = 1, drawPoints = false, sourceName = "sortedLines"}) {
    return flatMap((data: FilterData) => DrawUtil.loadBase64AsCanvas(data.img.data).pipe(map(canvas => {
        const sortedLines = data.getData(sourceName);
        console.log(sortedLines + " " + sourceName)

        if (sortedLines instanceof DistancePointContainer) {
          console.log("spline ")

          const lines = sortedLines.getLines();

          const polys: CPolygon[] = [];
          polys.push(new CPolygon());
          let index = 0;

          lines.forEach(line => {
            line.points.forEach(point => {
              if (polys[index].x.length == 0 || polys[index].x[polys[index].x.length - 1] != point.x) {
                polys[index].addPoint(point.x, point.y);
              } else {
                console.log("Skipping double points")
              }
            });

            if (sortedLines.getDistanceToNextLine(sortedLines.getIndexOfLine(line)) == -1) {
              polys.push(new CPolygon());
              index++;
            }
          });

          for (let i = 0; i < polys.length; i++) {
            const bezierPoly = SplineUtil.computeSplineCurve(polys[i], tension, false);
            // draw each bezier segment
            const last = bezierPoly.size - 1;
            for (let i = 0; i < last; i += 3) {
              DrawUtil.drawSpline(canvas, bezierPoly.x[i], bezierPoly.y[i], bezierPoly.x[i + 1], bezierPoly.y[i + 1], bezierPoly.x[i + 2], bezierPoly.y[i + 2], bezierPoly.x[i + 3], bezierPoly.y[i + 3], lineColor, size, drawPoints);
            }
          }

          data.img.data = DrawUtil.canvasAsBase64(canvas);
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

      const newImg = Object.assign(new CImage(), data.img);
      newImg.id = btoa(newName);

      data.pushIMG(newImg);

      if (!copyLayer)
        newImg.layers = data.img.layers;

      observer.next(data);
      observer.complete();
    }).pipe(flatMap(data => this.imageService.createImage(data.img, 'png').pipe(
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
          displayCallback.displayCallBack(data.imgStack[img]);
        else
          displayCallback.displayCallBack(data.img);
      }
      observer.next(data);
      observer.complete();
    }));
  }

  public overlay(imgs: number[], imageType: ColorType = 0) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {

        if (imgs.length >= 2 && data.imgStack.length >= 2) {

          console.log("Overlay");

          if (!isNumber(imgs[0]) && imgs[0] > 0 && imgs[0] < data.imgStack.length)
            observer.error();

          const buff = new Buffer(data.imgStack[imgs[0]].data, 'base64');
          const png = PNG.sync.read(buff);

          for (let i = 1; i < imgs.length; i++) {

            if (!isNumber(imgs[i]) && imgs[i] > 0 && imgs[i] < data.imgStack.length)
              observer.error(`Wrong argument ${imgs[i]}`);

            const buff2 = new Buffer(data.imgStack[imgs[i]].data, 'base64');
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

          //
          let buffer = PNG.sync.write(png, {colorType: imageType});
          this.pushImg();
          data.img.data = buffer.toString('base64');

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

      const imToCopy = index != undefined ? data.imgStack[index] : data.img;
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


class HostData {
  formula: string;
  topPosition: Point

  constructor(formula: string, topPosition: Point) {
    this.formula = formula;
    this.topPosition = topPosition;
  }
}
