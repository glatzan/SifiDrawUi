import {Injectable} from '@angular/core';
import {User} from '../model/user';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {AuthResponse} from '../model/AuthResponse';
import {map} from 'rxjs/operators';
import {UserSettings} from "../model/user-settings";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private static httpJsonContent = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  private currentUserSettingsSubject: BehaviorSubject<UserSettings>;
  public currentUserSettings: Observable<UserSettings>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();

    this.currentUserSettingsSubject = new BehaviorSubject<UserSettings>(JSON.parse(localStorage.getItem('currentUserSettings')));
    this.currentUserSettings = this.currentUserSettingsSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  public get currentUserSettingsValue(): UserSettings {
    return this.currentUserSettingsSubject.value;
  }

  login(username: string, password: string) {
    const user = new User();
    user.name = username;
    user.password = password;

    return this.http.post<AuthResponse>(`${environment.backendUrl}/login`, user)
      .pipe(map(response => {
        // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
        user.authdata = window.btoa(response.token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.loadUserSettings();
        return user;
      }));
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  loadUserSettings() {
    this.getUserSettings(this.currentUserValue.name).subscribe(x => {
      localStorage.setItem('currentUserSettings', JSON.stringify(x));
        this.currentUserSettingsSubject.next(x);
      }
    )
  }

  public getUserSettings(id: string): Observable<UserSettings> {
    return this.http.get<UserSettings>(`${environment.backendUrl}/user/settings/${id}`);
  }

  public updateUserSettings(userSettings: UserSettings): Observable<UserSettings> {
    console.log(`${environment.backendUrl}/user/settings/update`);
    return this.http.post<UserSettings>(`${environment.backendUrl}/user/settings/update`, userSettings, AuthenticationService.httpJsonContent);
  }
}
