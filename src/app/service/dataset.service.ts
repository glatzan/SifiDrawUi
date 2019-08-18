import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {ProjectData} from "../model/project-data";
import {Dataset} from "../model/dataset";

@Injectable({
  providedIn: 'root'
})
export class DatasetService {

  private serverURL = "http://127.0.0.1:8080"

  constructor(private _http: HttpClient) {
  }

  public getDataset(id: String): Observable<Dataset> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    console.log(`${this.serverURL}/dataset`)
    return this._http.get<Dataset>(`${this.serverURL}/dataset/${id}`, httpOptions);
  }

  public createDataset(id: String): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
    console.log(`${this.serverURL}/dataset/new/${id}`)
    return this._http.post(`${this.serverURL}/dataset/new/${id}`, "", httpOptions);
  }
}
