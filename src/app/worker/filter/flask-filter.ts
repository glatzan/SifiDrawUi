import {flatMap, map} from "rxjs/operators";
import {FilterData} from "../filter-data";
import {AbstractFilter, Services} from "./abstract-filter";

export class FlaskFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter(sourcePos: number, endpoint: string, targetPos = sourcePos) {
    return flatMap((data: FilterData) => this.services.flaskService.processImage(this.getImage(sourcePos, data), endpoint).pipe(map(cimg => {
      const target = this.getImage(targetPos, data);
      if (!target)
        throw new Error(`FlaskFilter: TargetImage not found on index: ${sourcePos}`);

      console.log('Fask img' + atob(cimg.id));

      target.data = cimg.data;
      return data;
    })));
  }
}


