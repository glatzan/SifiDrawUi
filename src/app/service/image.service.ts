import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ProjectData} from '../model/project-data';
import {CImage} from '../model/cimage';
import {environment} from "../../environments/environment";

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

  public setImage(image: CImage): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({})
    };
    return this.http.put<CImage>(`${environment.backendUrl}/image`, image, httpOptions);
  }

  public createImage(image: CImage, type : string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({})
    };
    console.log(`${environment.backendUrl}}/image/${type}`);
    return this.http.post<CImage>(`${environment.backendUrl}/image/${type}`, image, httpOptions);
  }
}
