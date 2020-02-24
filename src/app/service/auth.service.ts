import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {User} from '../model/user';
import * as moment from 'moment';
import {AuthResponse} from '../model/AuthResponse';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {
  }

  private serverURL = 'http://127.0.0.1:8080/login';

  login(user: User) {
    return this.http.post<AuthResponse>(this.serverURL, user).pipe(
      map(res => this.setSession(res))
    );
  }

  setSession(response: AuthResponse) {
    const expiresAt = moment().add(response.expires, 'millisecond');

    localStorage.setItem('c_token', response.token);
    localStorage.setItem('c_expires', JSON.stringify(expiresAt.valueOf()));
  }

  logout() {
    localStorage.removeItem('c_token');
    localStorage.removeItem('c_expires');
  }

  public isLoggedIn() {
    return moment().isBefore(this.getExpiration());
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  getExpiration() {
    const expiration = localStorage.getItem('c_expires');
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }

}
