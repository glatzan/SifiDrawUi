import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {CImage} from '../model/CImage';
import {environment} from "../../environments/environment";
import {catchError, map} from "rxjs/operators";
import {CImageMapper} from "../utils/cimage-mapper";
import {CImageGroup} from "../model/CImageGroup";
import {ICImage} from "../model/ICImage";
import {ImageGroupService} from "./image-group.service";

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private static httpJsonContent = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient,
              private imageGroupService: ImageGroupService) {
  }

  public getImage(id: string): Observable<CImage> {
    return this.http.get<CImage>(`${environment.backendUrl}/image/${id}`, ImageService.httpJsonContent).pipe(
      map(x => {
        return CImageMapper.mapToTypescriptObject<CImage>(x);
      })
    );
  }

  public updateImage(image: CImage): Observable<any> {
    console.log(`${environment.backendUrl}/image/update`);
    return this.http.put<CImage>(`${environment.backendUrl}/image/update`, image, ImageService.httpJsonContent);
  }

  public createImage(image: CImage, type: string): Observable<any> {
    console.log(`${environment.backendUrl}}/image/${type}`);
    return this.http.post<CImage>(`${environment.backendUrl}/image/${type}`, image);
  }

  public uploadImage(file, path: string, overwrite: boolean): Observable<boolean> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    console.log(`Upload ${file.name} to ${path}`)
    return this.http.post(`${environment.backendUrl}/image/upload/${btoa(path)}&${overwrite ? 'o' : ''}`, formData).pipe(
      map(() => {
        return true;
      }), catchError(_ => of(false))
    );
  }

  public updateICImage(image: ICImage): Observable<any> {
    if (image instanceof CImage) {
      return this.updateImage(image);
    } else {
      return this.imageGroupService.updateImageGroup(image as CImageGroup);
    }
  }
}
