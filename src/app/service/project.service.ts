import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Project} from "../model/project";
import {environment} from "../../environments/environment";
import {AbstractHttpService} from "./abstract-http-service";
import {CImageMapper} from "../utils/cimage-mapper";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ProjectService extends AbstractHttpService {

  constructor(private http: HttpClient) {
    super();
  }

  public getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${environment.backendUrl}/projects`).pipe(
      map( project => CImageMapper.mapProjectsToTypescriptObject(project))
    )
  }

  public createProject(dir: string): Observable<any> {
    console.log(`${environment.backendUrl}/projects/create/${btoa(dir)}`);
    return this.http.get<any>(`${environment.backendUrl}/projects/create/${btoa(dir)}`);
  }

  public deleteProject(project: Project): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.backendUrl}/projects/delete/${project.id}`);
  }
}
