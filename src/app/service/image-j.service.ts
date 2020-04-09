import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {SImage} from "../model/SImage";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ImageJService {

  constructor(private _http: HttpClient) {
  }

  public getLines(image: SImage): Observable<string> {

    const httpOptions = {
      headers: new HttpHeaders({})
    };

    console.log(`${environment.jImageService}/imagej/lines`);

    return this._http.post<string>(`${environment.jImageService}/imagej/lines`, image, httpOptions);
  }
}
