import {Injectable} from '@angular/core';
import {Filter} from '../model/filter/filter';

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
