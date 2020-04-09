import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {SImage} from "../model/SImage";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ImageMagicService {

  constructor(private _http: HttpClient) {
  }

  public performMagic(image: SImage, command: string) : Observable<SImage>{
    const httpOptions = {
      headers: new HttpHeaders({})
    };
    console.log(`${environment.backendUrl}/magic/${btoa(command)}`);
    return this._http.post<SImage>(`${environment.backendUrl}/magic/${btoa(command)}`, image, httpOptions);
  }
}
