import { Injectable } from '@angular/core';
import {CImage} from "../model/cimage";
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class FlaskService {

  private serverURL = 'http://127.0.0.1:5000';

  constructor(private _http: HttpClient) {
  }

  public processImage(image : CImage, endpoint: string) : Observable<CImage>{
    const httpOptions = {
      headers: new HttpHeaders({})
    };
    console.log(`${this.serverURL}/${endpoint}`);
    return this._http.post<CImage>(`${this.serverURL}/${endpoint}`, image, httpOptions);
  }
}
