import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {FbAuthResponse, User} from '../../../shared/interfaces';
import {Observable, Subject, throwError} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {catchError, tap} from 'rxjs/operators';
import {AuthEnum} from '../../../shared/enums/auth.enum';

@Injectable()
export class AuthService {

  public error$: Subject<string> = new Subject<string>(); // why not just 'string' ?

  constructor(private http: HttpClient) {}

  // get ?
  public get token(): string {
    const expDate = new Date(localStorage.getItem('fb-token-exp'));

    if (new Date() > expDate) {
      this.logout();
      return null;
    }

    return localStorage.getItem('fb-token');
  }

  public login(user: User): Observable<any> {
    user.returnSecureToken = true;
    return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.apiKey}`, user)
      .pipe(
        tap<FbAuthResponse>(this.setToken),
        catchError(this.handleError.bind(this)) // why to bind ?
      );
  }

  public logout(): void {
    this.setToken(null);
  }

  public isAuthenticated(): boolean {
    return Boolean(this.token);
  }

  // why do we need to return Observable ?
  private handleError(error: HttpErrorResponse): Observable<any>{
    const {message} = error.error.error; // what ?

    this.error$.next(AuthEnum[message]);

    return throwError(error);
  }

  private setToken(response: FbAuthResponse | null): void {
    if (response) {
      const expDate = new Date(new Date().getTime() + +response.expiresIn * 1000);
      localStorage.setItem('fb-token', response.idToken);
      localStorage.setItem('fb-token-exp', expDate.toString());
    } else {
      localStorage.clear();
    }
  }
}

// [1,2,3,4].forEach(f);
//
// function f(i) {
//   console.log(i);
// }
