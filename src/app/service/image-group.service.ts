import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Dataset} from '../model/dataset';
import {environment} from '../../environments/environment';
import {CImageGroup} from "../model/CImageGroup";
import {CImage} from "../model/CImage";

@Injectable({
  providedIn: 'root'
})
export class ImageGroupService {

  constructor(private http: HttpClient) {
  }

  public createImageGroup(dataset: Dataset, name: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    console.log(`${environment.backendUrl}}/imagegroup/create`);
    return this.http.post<any>(`${environment.backendUrl}/imagegroup/create`, `{"datasetpath" : "${atob(dataset.id)}", "groupName" : "${name}"}`, httpOptions);
  }

  public addImageToGroup(imageGroup: CImageGroup, image: CImage) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    console.log(`${environment.backendUrl}}/imagegroup/create`);
    return this.http.post<any>(`${environment.backendUrl}/imagegroup/addImage`, `{"group" : ${JSON.stringify(imageGroup)}, "image" : ${JSON.stringify(image)}}`, httpOptions);
  }
}
