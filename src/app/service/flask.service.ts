 import { Injectable } from '@angular/core';
import {SImage} from "../model/SImage";
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

  public processImage(image : SImage, endpoint: string) : Observable<SImage>{
    const httpOptions = {
      headers: new HttpHeaders({})
    };
    console.log(`${environment.flaskServer}/${endpoint}`);
    return this._http.post<SImage>(`${environment.flaskServer}/${endpoint}`, image, httpOptions);
  }
}
