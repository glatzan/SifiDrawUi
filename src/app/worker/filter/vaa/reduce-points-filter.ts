import {AbstractFilter, Services} from "../abstract-filter";
import {map} from "rxjs/operators";
import {ICImage} from "../../../model/ICImage";
import {FilterData} from "../../filter-data";
import {ComplexLine} from "../../../utils/vaa/model/complex-line";
import {SimpleLine} from "../../../utils/vaa/model/simple-line";

export class ReducePointsFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(modulo : number, lineData: string = "lines") {
    return map((data: FilterData) => {
      const sortedLines = data.getData(lineData);

      if (sortedLines instanceof ComplexLine) {

        for (let i = 0; i < sortedLines.countLines(); i++) {
          const line = sortedLines.getLine(i);

          if (line instanceof SimpleLine) {
            const p = new SimpleLine();

            p.id = line.id;
            p.length = line.length;

            p.addPoint(line.getFirstPoint());

            for (let y = 1; y < line.points.length; y = y + modulo) {
              if (p.getLastPoint().x != line.points[y].x) {
                p.addPoint(line.points[y]);
              }
            }

            if (p.getLastPoint().x != line.getLastPoint().x) {
              p.points[p.points.length - 1] = line.getLastPoint();
              // p.addPoint(line.getLastPoint())
            }

            if (p.points.length < 2) {
              p.addPoint(line.getLastPoint());
            }

            sortedLines.setLine(i, p);
          }
        }
      }else{
        throw new Error(`ReducePointsFilter: Source line not found!`)
      }

      return data;
    });
  }
}


