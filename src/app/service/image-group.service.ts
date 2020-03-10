import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Dataset} from '../model/dataset';
import {environment} from '../../environments/environment';
import {CImageGroup} from '../model/CImageGroup';
import {CImage} from '../model/CImage';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {CImageMapper} from '../utils/cimage-mapper';

@Injectable({
  providedIn: 'root'
})
export class ImageGroupService {

  private static httpJsonContent = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {
  }

  public createImageGroup(dataset: Dataset, name: string) {
    console.log(`${environment.backendUrl}}/imagegroup/create`);
    return this.http.post<any>(`${environment.backendUrl}/imagegroup/create`,
      `{"datasetpath" : "${atob(dataset.id)}", "groupName" : "${name}"}`, ImageGroupService.httpJsonContent);
  }

  public addImageToGroup(imageGroup: CImageGroup, image: CImage) {
    console.log(`${environment.backendUrl}}/imagegroup/create`);
    return this.http.post<any>(`${environment.backendUrl}/imagegroup/addImage`,
      `{"group" : ${JSON.stringify(imageGroup)}, "image" : ${JSON.stringify(image)}}`, ImageGroupService.httpJsonContent);
  }

  public updateImageGroup(group: CImageGroup): Observable<CImageGroup> {
    console.log(`${environment.backendUrl}/imagegroup/update`);
    group.concurrencyCounter++;
    group.images.forEach(image => {
      image.concurrencyCounter++;
    });
    return this.http.put<CImageGroup>(`${environment.backendUrl}/imagegroup/update`, group, ImageGroupService.httpJsonContent).pipe(
      map(x => {
        return CImageMapper.mapToTypescriptObject<CImageGroup>(x);
      })
    );
  }

  public getImageGroup(id: string, format : string = "png"): Observable<CImageGroup> {
    return this.http.get<CImageGroup>(`${environment.backendUrl}/imagegroup/${id}?format=${format}`, ImageGroupService.httpJsonContent).pipe(
      map(x => {
        return CImageMapper.mapToTypescriptObject<CImageGroup>(x);
      })
    );
  }

  public deleteImageGroup(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.backendUrl}/imagegroup/delete/${id}`);
  }


  public cloneImageGroup(group: CImageGroup, targetDir: string = null): Observable<CImageGroup> {
    return this.http.get<CImage>(`${environment.backendUrl}/imagegroup/clone/${group.id}${targetDir ? '?targetDir=' + btoa(targetDir) : ''}`, ImageGroupService.httpJsonContent).pipe(
      map(x => {
        return CImageMapper.mapToTypescriptObject<CImageGroup>(x);
      })
    );
  }
}
