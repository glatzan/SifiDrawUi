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
      map(project => CImageMapper.mapProjectsToTypescriptObject(project))
    )
  }

  public createProject(name: string): Observable<any> {
    return this.http.get<any>(`${environment.backendUrl}/projects/create/${btoa(name)}`);
  }

  public deleteProject(project: Project): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.backendUrl}/projects/delete/${project.id}`);
  }

  public renameProject(project: Project): Observable<Project> {
    return this.http.get<Project>(`${environment.backendUrl}/projects/rename/${project.id}?newName=${btoa(project.name)}`);
  }
}
