import {Injectable} from '@angular/core';
import {CImage} from "../model/CImage";
import CImageUtil from "../utils/cimage-util";
import {ImageService} from "./image.service";
import {forkJoin, Observable} from 'rxjs';
import {flatMap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ScImportService {

  constructor(public imageService: ImageService) {
  }


  public processData(mapping: { maxX: number, maxY: number, maps: [{ name: string, path: string }] }, idata: [{ id: number, x: number, y: number, tag: string, name: string, idimage: string, idanalysis: string }]): Observable<any> {

    const simpleObservable = new Observable((observer) => {

      let arr: { [key: string]: CImage } = {};
      let missingMappings = new Set();

      const colors = ['#FFFFFF', '#2919ff', '#FF33FF', '#FFFF99', '#00B3E6',
        '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
        '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
        '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
        '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
        '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
        '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
        '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
        '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
        '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

      for (let col of idata) {
        // foldername-imageid
        const imgName = col.name.split("-");
        let img = arr[col.name];
        if (img == undefined) {
          const map = mapping.maps.find((x) => x.name === imgName[0]);

          if (map == undefined) {
            missingMappings.add(imgName[0]);
            continue;
          }

          arr[col.name] = new CImage();
          img = arr[col.name];
          img.name = imgName[1];
          img.id = btoa(map.path + img.name);
          //img.id = map.path + img.name;
        }

        const layer = CImageUtil.findOrAddLayer(img, col.tag + 1);
        layer.color = colors[col.tag]
        const lastLIne = CImageUtil.initLastLineOfLayer(layer);

        if (col.x >= 0 && col.x <= mapping.maxX && col.y >= 0 && col.y <= mapping.maxY)
          CImageUtil.addPointToLine(lastLIne, col.x, col.y);
        else
          console.log(`Fehler Punkt ${col.x}/${col.y} nicht in bounds (${mapping.maxX}/${mapping.maxY})`)
      }

      for (let map of missingMappings) {
        console.log(`Mapping for ${map} is missing`);
      }

      observer.next(arr)
      observer.complete()
    });

    return simpleObservable.pipe(flatMap(arr => {
      let result = []
      for (let imgToSave of Object.keys(arr)) {
        result.push(this.imageService.setImage(arr[imgToSave]));
      }
      console.log("forkjoin")
      console.log(arr)
      return forkJoin(result);
    }))
  }
}
