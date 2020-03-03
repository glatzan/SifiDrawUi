import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {CImage} from "../model/CImage";
import {environment} from "../../environments/environment";
import {UserSettings} from "../model/user-settings";

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {

  private static httpJsonContent = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {
  }

  public getUserSettings(id: string): Observable<CImage> {
    return this.http.get<CImage>(`${environment.backendUrl}/user/settings/${id}`);
  }

  public updateUserSettings(userSettings: UserSettings): Observable<UserSettings> {
    console.log(`${environment.backendUrl}/image/update`);
    return this.http.put<UserSettings>(`${environment.backendUrl}/user/settings/update`, userSettings, UserSettingsService.httpJsonContent);
  }
}
