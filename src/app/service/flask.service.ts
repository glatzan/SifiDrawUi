import { Injectable } from '@angular/core';
import {CImage} from "../model/CImage";
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {error} from "selenium-webdriver";
import ElementNotVisibleError = error.ElementNotVisibleError;
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class FlaskService {

  constructor(private _http: HttpClient) {
  }

  public processImage(image : CImage, endpoint: string) : Observable<CImage>{
    const httpOptions = {
      headers: new HttpHeaders({})
    };
    console.log(`${environment.flaskServer}/${endpoint}`);
    return this._http.post<CImage>(`${environment.flaskServer}/${endpoint}`, image, httpOptions);
  }
}
