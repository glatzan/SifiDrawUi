import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {CImage} from '../model/CImage';
import {environment} from "../../environments/environment";
import {catchError, map} from "rxjs/operators";
import {Dataset} from "../model/dataset";

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private http: HttpClient) {
  }

  public getImage(id: string): Observable<CImage> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.get<CImage>(`${environment.backendUrl}/image/${id}`, httpOptions);
  }

  public updateImage(image: CImage): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    console.log(`${environment.backendUrl}/image/update`);
    return this.http.put<CImage>(`${environment.backendUrl}/image/update`, image, httpOptions);
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
}
