import {Injectable} from '@angular/core';
import {Filter} from '../filter/filter';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor() {
  }

  public getAllFilters(): Filter[] {
    return new Array<Filter>();
  }
}
