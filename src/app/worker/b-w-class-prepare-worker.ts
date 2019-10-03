import {FilterWorker} from "./filter-worker";
import {ImageService} from "../service/image.service";
import {FilterData} from "./filter-data";
import {Observable} from "rxjs";
import {flatMap} from "rxjs/operators";
import {PNG} from "pngjs";
import {Layer} from "../model/layer";

export class BWClassPrepareWorker extends FilterWorker {

  public constructor(parent: FilterWorker) {
    super(parent);
  }

  public doWork(parent: FilterWorker, data: FilterData): Observable<FilterData> {
    console.log("Call OrigImageWorker");
    const s = new Observable<FilterData>((observer) => {

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
    });

    return this.doChain(s);
  }
}
