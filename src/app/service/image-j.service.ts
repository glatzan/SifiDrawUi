import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {CImage} from "../model/cimage";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ImageJService {

  //private serverURL = 'http://192.168.10.114:8080';
    private serverURL = 'http://127.0.0.1:8080';

  constructor(private _http: HttpClient) {
  }

  public getLines(image: CImage): Observable<string> {

    const httpOptions = {
      headers: new HttpHeaders({})
    };

    console.log(`${this.serverURL}/imagej/lines`);

    return this._http.post<string>(`${this.serverURL}/imagej/lines`, image, httpOptions);
  }
}
