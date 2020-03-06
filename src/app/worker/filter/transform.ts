import {flatMap} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {Observable} from "rxjs";
import {Layer} from "../../model/layer";
import {fromTriangles} from "transformation-matrix";

/// <reference path="Filter.ts" />
namespace Filter {

  export function createAffineTransformationMatrix({img1Pos = null, img2Pos = null, layerImg1ID = null, layerImg2ID = layerImg1ID, targetName = 'affineMatrix'}: { img1Pos: number, img2Pos: number, layerImg1ID: string, layerImg2ID: string, targetName?: string }) {
    return flatMap((data: FilterData) => new Observable<FilterData>((observer) => {
      console.log(`Create affine Matrix`);
      if (img1Pos < 0 || img1Pos >= data.imgStack.length || img2Pos < 0 || img2Pos >= data.imgStack.length) {
        observer.error(`Clone Image out of bounds IMG 1 ${img1Pos} or IMG 2 ${img2Pos}; Max size: ${data.imgStack.length}`);
      }

      const findLayer = function (layers: Layer[], id: string): Layer {
        for (let layer of layers) {
          if (layer.id == layerImg1ID) {
            return layer;
          }
        }
        return null
      };

      const img1 = data.imgStack[img1Pos];
      const img2 = data.imgStack[img2Pos];

      const layer1 = findLayer(img1.layers, layerImg1ID);
      const layer2 = findLayer(img2.layers, layerImg2ID);

      if (layer1 === null || layer2 === null || layer1.lines.length <= 0) {
        observer.error(`Layer not found on IMG 1 ${layerImg1ID} or IMG 2 ${layerImg2ID};`);
      }

      if (layer1.lines[0].length < 3 || layer2.lines.length <= 0 || layer2.lines[0].length < 3) {
        observer.error(`Three dots in layer (line 1) needed Layer 1 ${layerImg1ID} or Layer 2 ${layerImg2ID};`);
      }

      const t1 = layer1.lines[0].slice(0, 3).map(x => {
        return {x: x.x, y: x.y}
      });
      const t2 = layer2.lines[0].slice(0, 3).map(x => {
        return {x: x.x, y: x.y}
      });

      const resultMatrix = fromTriangles(t1, t2);

      console.log(resultMatrix);

      data.setData(targetName, resultMatrix);

      observer.next(data);
      observer.complete();
    }));
  }
}

