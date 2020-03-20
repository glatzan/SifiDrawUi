import {AbstractFilter, Services} from "../abstract-filter";
import {flatMap, map} from "rxjs/operators";
import {FilterData} from "../../filter-data";
import {SimpleLine} from "../../../utils/vaa/model/simple-line";
import {Vector} from "../../../utils/vaa/model/vector";
import {ComplexLine} from "../../../utils/vaa/model/complex-line";

export class FindCenterLineFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, centerLineData: string = "lines") {
    return flatMap((data: FilterData) =>
      this.services.imageJService.getLines(this.getImage(sourcePos, data)).pipe(
        map(json => {
            console.log(`Searching for Lines ..`);
            const map = new Map<string, SimpleLine>();

            for (const res of json) {
              let contour = map.get(res['Contour ID']);
              // @ts-ignore
              const point = new Vector(Math.round(res.X), Math.round(res.Y), res['Pos.']);

              if (!contour) {
                // @ts-ignore
                contour = map.set(res['Contour ID'], new SimpleLine(res['Contour ID'], res.Length)).get(res['Contour ID']);
              }

              contour.addPoint(point);
            }
            const dis = new ComplexLine();
            dis.addLines(Array.from(map.values()));

            for (const line of dis.lines) {
              if (line.getFirstPoint().x > line.getLastPoint().x) {
                line.reverse();
              }
            }


            dis.lines.sort((n1, n2) => {
              if (n1.getFirstPoint().x > n2.getFirstPoint().x) {
                return 1;
              } else if (n1.getFirstPoint().x < n2.getFirstPoint().x) {
                return -1;
              } else {
                return 0;
              }
            });

            data.setData(centerLineData, dis);
            return data;
          }
        )
      )
    );
  }
}
