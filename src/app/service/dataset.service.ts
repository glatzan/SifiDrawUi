import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {Dataset} from "../model/dataset";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class DatasetService {


  constructor(private http: HttpClient) {
  }

  public getDataset(id: string): Observable<Dataset> {
    console.log(id)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    console.log(`${environment.backendUrl}/dataset`)
    return this.http.get<Dataset>(`${environment.backendUrl}/dataset/${id}`, httpOptions);
  }

  public getDatasets(id: string[]): Observable<Dataset[]> {
    console.log('id')
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    console.log(`${environment.backendUrl}/dataset`)
    return this.http.get<Dataset[]>(`${environment.backendUrl}/datasets/${id.join("-")}`, httpOptions);
  }

  public createDataset(id: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    console.log(`${environment.backendUrl}/dataset/new/${id}`)
    return this.http.post(`${environment.backendUrl}/dataset/new/${id}`, "", httpOptions);
  }
}
