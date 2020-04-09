import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Project} from "../model/project";
import {environment} from "../../environments/environment";
import {AbstractHttpService} from "./abstract-http-service";

@Injectable({
  providedIn: 'root'
})
export class ProjectService extends AbstractHttpService {

  constructor(private http: HttpClient) {
    super();
  }

  public getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${environment.backendUrl}/projects`);
  }

  public createProject(dir: string): Observable<any> {
    console.log(`${environment.backendUrl}/projects/create/${btoa(dir)}`);
    return this.http.get<any>(`${environment.backendUrl}/projects/create/${btoa(dir)}`);
  }
}
