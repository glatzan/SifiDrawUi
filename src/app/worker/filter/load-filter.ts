import {AbstractFilter, Services} from "./abstract-filter";
import {flatMap, map} from "rxjs/operators";
import {SAImage} from "../../model/SAImage";
import {FilterData} from "../filter-data";
import {Observable} from "rxjs";
import {SImage} from "../../model/SImage";

export class LoadFilter extends AbstractFilter {

  constructor(services: Services) {
    super(services);
  }

  doFilter() {
    return flatMap((data: SAImage) => this.loadICImage(data).pipe(map(cimg => {
      console.log(`Load img ${atob(cimg.id)}`);
      const filterData = new FilterData();
      filterData.pushICIMG(cimg);
      filterData.originalImage = cimg;
      return filterData;
    })));
  }

  private loadICImage(img: SAImage): Observable<SAImage> {
    if (img instanceof SImage) {
      return this.services.imageService.getImage(img.id);
    } else {
      return this.services.imageGroupService.getImageGroup(img.id);
    }
  }
}


