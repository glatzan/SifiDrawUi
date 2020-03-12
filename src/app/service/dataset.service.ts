import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Dataset} from '../model/dataset';
import {environment} from '../../environments/environment';
import {CImage} from '../model/CImage';
import {map} from 'rxjs/operators';
import {CImageMapper} from "../utils/cimage-mapper";

@Injectable({
  providedIn: 'root'
})
export class DatasetService {


  constructor(private http: HttpClient) {
  }

  public getDataset(id: string): Observable<Dataset> {
    console.log(`${environment.backendUrl}/dataset/${id}`);
    return this.http.get<Dataset>(`${environment.backendUrl}/dataset/${id}?minimize=true`).pipe(
      map(x => {
        let i = 0;
        for (const img of x.images) {
          x.images[i] = CImageMapper.mapToTypescriptObject(img);
          i++;
        }
        return x;
      })
    );
  }

  public getDatasets(id: string[]): Observable<Dataset[]> {
    console.log(`${environment.backendUrl}/dataset`);
    const datasets = btoa(id.join('-'));
    return this.http.get<Dataset[]>(`${environment.backendUrl}/datasets/${datasets}`);
  }

  public createDataset(id: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    console.log(`${environment.backendUrl}/dataset/new/${id}`);
    return this.http.post(`${environment.backendUrl}/dataset/new/${id}`, '', httpOptions);
  }

  public addImageToDataset(dataset: Dataset, image: CImage) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    console.log(`${environment.backendUrl}}/imagegroup/create`);
    return this.http.post<any>(`${environment.backendUrl}/dataset/addImage`, `{"dataset" : ${JSON.stringify(dataset)}, "image" : ${JSON.stringify(image)}}`, httpOptions);
  }
}
