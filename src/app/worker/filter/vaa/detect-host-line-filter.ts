import {AbstractFilter, Services} from "../abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../../filter-data";
import {ComplexLine} from "../../../utils/vaa/model/complex-line";
import {HostParabola} from "../../../utils/vaa/host-parabola";
import {LineJoiner} from "../../../utils/vaa/line-joiner";
import {FilterHelper} from "../filter-helper";

export class DetectHostLineFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(targetPos = -1,lineSource = "lines", hostParabola = "hostParabola") {
    return map((data: FilterData) => {

      const complexLine = data.getData(lineSource);
      const parabola = data.getData(hostParabola);

      const target = this.getImage(targetPos,data);
      const canvas = FilterHelper.imageToCanvas(target);

      if (complexLine instanceof ComplexLine && complexLine.hasPoints() && parabola instanceof HostParabola) {
        console.log('Detect Host line');
        console.log(complexLine);
        const hostline = LineJoiner.joinComplexLine(complexLine, parabola, canvas);
        HostParabola.paintLines(hostline, canvas);
        data.setData('hostLine', hostline);
      }else{
        throw new Error(`DetectHostLineFilter: Line or Parabola Data do not match.`)
      }

      FilterHelper.canvasToImage(canvas, target);
      return data
    });
  }
}


