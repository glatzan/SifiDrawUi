import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ProjectData} from '../model/project-data';
import {Image} from '../model/image';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private serverURL = "http://127.0.0.1:8080"

  constructor(private _http: HttpClient) {
  }

  public getImage(id: string): Observable<Image> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }

    return this._http.get<Image>(`${this.serverURL}/image/${id}`, httpOptions);
  }
}
