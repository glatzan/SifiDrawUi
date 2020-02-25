import {Injectable} from '@angular/core';
import {HttpClient, HttpClientModule, HttpHeaders} from "@angular/common/http";
import {Observable, observable} from "rxjs";
import {ProjectData} from "../model/project-data";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private _http: HttpClient) {
  }

  public getProjects(): Observable<ProjectData[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }

    console.log(`${environment.backendUrl}/projects`)
    return this._http.get<ProjectData[]>(`${environment.backendUrl}/projects`, httpOptions);
  }
}
