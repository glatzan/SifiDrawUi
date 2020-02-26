import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {FilterSet} from '../model/FilterSet';

@Injectable({
  providedIn: 'root'
})
export class FilterSetService {

  constructor(private http: HttpClient) {
  }

  public getFilters(): Observable<FilterSet[]> {
    console.log(`${environment.backendUrl}/filters`);
    return this.http.get<FilterSet[]>(`${environment.backendUrl}/filters`);
  }

  public createFilterSet(filterSet: FilterSet): Observable<any> {
    console.log(`${environment.backendUrl}/filters/create`);
    return this.http.post<any>(`${environment.backendUrl}/filters/create`, filterSet);
  }

  public deleteFilterSet(id: number): Observable<any> {
    console.log(`${environment.backendUrl}/filters/delete/${id}`);
    return this.http.delete<any>(`${environment.backendUrl}/filters/delete/${id}`);
  }

  public saveFilterSet(filterSet: FilterSet): Observable<FilterSet> {
    console.log(`${environment.backendUrl}/filters/save`);
    return this.http.put<FilterSet>(`${environment.backendUrl}/filters/save`, filterSet);
  }

}
