import {Injectable} from '@angular/core';
import {HttpClient, HttpClientModule, HttpHeaders} from "@angular/common/http";
import {Observable, observable} from "rxjs";
import {ProjectData} from "../model/project-data";

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private serverURL = "http://127.0.0.1:8080"

  constructor(private _http: HttpClient) {
  }

  public getProjects(): Observable<ProjectData[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }

    console.log(`${this.serverURL}/projects`)
    return this._http.get<ProjectData[]>(`${this.serverURL}/projects`, httpOptions);
  }
}
