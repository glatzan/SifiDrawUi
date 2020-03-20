import {AbstractFilter, Services} from "../abstract-filter";
import {map} from "rxjs/operators";
import {FilterData} from "../../filter-data";
import {ComplexLine} from "../../../utils/vaa/model/complex-line";
import {HostParabola} from "../../../utils/vaa/host-parabola";
import {GraftFinder} from "../../../utils/vaa/graft-finder";
import {FilterHelper} from "../filter-helper";

export class DetectGraftLineFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(targetPos = -1, lineSource = "graftLines", hostParabola = "hostParabola") {
    return map((data: FilterData) => {

      const complexLine = data.getData(lineSource);
      const parabola = data.getData(hostParabola);

      const target = this.getImage(targetPos, data);
      const canvas = FilterHelper.imageToCanvas(target);

      if (complexLine instanceof ComplexLine && complexLine.hasPoints() && parabola instanceof HostParabola) {
        console.log('Graft');
        const likelyLines = GraftFinder.removeUnlikelyLines(complexLine, parabola, canvas);
        const joinedLines = GraftFinder.joinLines(likelyLines, parabola, canvas);
        parabola.drawParabola(canvas);
        data.setData('graftLines', joinedLines);
      } else {
        throw new Error(`DetectGraftLineFilter: Line or Parabola Data do not match.`)
      }

      FilterHelper.canvasToImage(canvas,target);

      return data;
    });
  }
}

