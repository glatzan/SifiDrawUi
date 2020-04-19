import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Dataset} from '../model/dataset';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {CImageMapper} from "../utils/cimage-mapper";
import {AbstractHttpService} from "./abstract-http-service";

@Injectable({
  providedIn: 'root'
})
export class DatasetService extends AbstractHttpService {


  constructor(private http: HttpClient) {
    super();
  }

  public getDataset(id: string, minimize = true): Observable<Dataset> {
    const fetchURL = `${environment.backendUrl}/dataset${minimize ? '/minimized' : ''}/${id}`;
    console.log(fetchURL);
    return this.http.get<Dataset>(fetchURL).pipe(
      map(x => CImageMapper.mapDatasetToTypescriptObject(x))
    );
  }

  public createDataset(name: string, projectID: string): Observable<any> {
    return this.http.get(`${environment.backendUrl}/dataset/create/${btoa(name)}?projectID=${projectID}`);
  }

  public deleteDataset(dataset: Dataset): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.backendUrl}/dataset/delete/${dataset.id}`);
  }

  public renameDataset(dataset: Dataset): Observable<Dataset> {
    return this.http.get<Dataset>(`${environment.backendUrl}/dataset/rename/${dataset.id}?newName=${btoa(dataset.name)}`);
  }
}
