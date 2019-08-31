import {Injectable} from '@angular/core';
import {ImageMagicFilter} from "../filter/image-magic-filter";
import {ImageFilter} from "../filter/image-filter";
import {ImageMagicService} from "./image-magic.service";
import {Filter} from "../filter/filter";
import {CImage} from "../model/cimage";
import {ImageEventFilter} from "../filter/image-event-filter";

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor(private imageMagicService: ImageMagicService) {
  }

  public getAllFilters(): Filter[] {
    return new Array<Filter>();
  }

  public getNewMagicFilter(parentFilter: ImageFilter, command: string) {
    const m = new ImageMagicFilter(parentFilter, command);
    m.imageMagicService = this.imageMagicService;
    return m;
  }

  public getNewEventFilter(parentFilter: ImageFilter, callBack: (image: CImage) => any, bind : any, origImage: CImage){
    return new ImageEventFilter(parentFilter, callBack.bind(bind), origImage)
  }
}
