import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {CImage} from "../model/CImage";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ImageMagicService {

  constructor(private _http: HttpClient) {
  }

  public performMagic(image: CImage, command: string) : Observable<CImage>{
    const httpOptions = {
      headers: new HttpHeaders({})
    };
    console.log(`${environment.backendUrl}/magic/${btoa(command)}`);
    return this._http.post<CImage>(`${environment.backendUrl}/magic/${btoa(command)}`, image, httpOptions);
  }
}
