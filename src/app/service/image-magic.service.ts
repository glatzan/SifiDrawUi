import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {CImage} from "../model/cimage";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ImageMagicService {

  private serverURL = 'http://127.0.0.1:8080';

  constructor(private _http: HttpClient) {
  }

  public performMagic(image: CImage, command: string) : Observable<CImage>{
    const httpOptions = {
      headers: new HttpHeaders({})
    };
    console.log(`${this.serverURL}/magic/${btoa(command)}`);
    return this._http.post<CImage>(`${this.serverURL}/magic/${btoa(command)}`, image, httpOptions);
  }
}
