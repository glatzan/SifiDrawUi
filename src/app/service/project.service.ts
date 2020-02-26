import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ProjectData} from "../model/project-data";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private http: HttpClient) {
  }

  public getProjects(): Observable<ProjectData[]> {
    console.log(`${environment.backendUrl}/projects`);
    return this.http.get<ProjectData[]>(`${environment.backendUrl}/projects`);
  }

  public createProject(dir: string): Observable<any> {
    console.log(`${environment.backendUrl}/projects/create/${btoa(dir)}`);
    return this.http.get<any>(`${environment.backendUrl}/projects/create/${btoa(dir)}`);
  }
}
