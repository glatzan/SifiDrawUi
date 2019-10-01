import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ProjectData} from '../model/project-data';
import {CImage} from '../model/cimage';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private serverURL = 'http://127.0.0.1:8080';

  constructor(private _http: HttpClient) {
  }

  public getImage(id: string): Observable<CImage> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    console.log(`${this.serverURL}/image/${id}`)

    return this._http.get<CImage>(`${this.serverURL}/image/${id}`, httpOptions);
  }

  public setImage(image: CImage): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({})
    };
    return this._http.put<CImage>(`${this.serverURL}/image`, image, httpOptions);
  }

  public createImage(image: CImage): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({})
    };
    console.log(`${this.serverURL}/image`);
    return this._http.post<CImage>(`${this.serverURL}/image/png`, image, httpOptions);
  }


}
