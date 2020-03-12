import {AbstractFilter, Services} from "./abstract-filter";
import {flatMap, map} from "rxjs/operators";
import {ICImage} from "../../model/ICImage";
import {FilterData} from "../filter-data";
import {Observable} from "rxjs";
import {CImage} from "../../model/CImage";

export class LoadFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter() {
    return flatMap((data: ICImage) => this.loadICImage(data).pipe(map(cimg => {
      console.log(`Load img ${atob(cimg.id)}`);
      const filterData = new FilterData();
      filterData.pushICIMG(cimg);
      filterData.originalImage = cimg;
      return filterData;
    })));
  }

  private loadICImage(img: ICImage): Observable<ICImage> {
    if (img instanceof CImage) {
      return this.services.imageService.getImage(img.id);
    } else {
      return this.services.imageGroupService.getImageGroup(img.id);
    }
  }
}


