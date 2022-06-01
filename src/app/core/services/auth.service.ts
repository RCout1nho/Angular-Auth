import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url: string = 'http://localhost:8080';
  private localStorageKey: string = '@angular-auth/access_token';

  constructor(private httpClient: HttpClient, private router: Router) {}

  private saveInLocalStorage(access_token: string) {
    localStorage.setItem(this.localStorageKey, access_token);
  }

  private removeFromLocalStorage() {
    localStorage.removeItem(this.localStorageKey);
  }

  private getTokenFromLocalStorage() {
    return localStorage.getItem(this.localStorageKey);
  }

  public login(payload: { email: string; password: string }): Observable<void> {
    return this.httpClient
      .post<{ token: string }>(`${this.url}/login`, payload)
      .pipe(
        map((res) => {
          this.saveInLocalStorage(res.token);
          this.router.navigate(['admin']);
        }),
        catchError((e) => {
          if (e.error.message) {
            return throwError(() => new Error(e.error.message));
          }

          return throwError(
            () =>
              new Error(
                'Erro de comunicação com o servidor, tente novamente mais tarde!'
              )
          );
        })
      );
  }

  public logout() {
    this.removeFromLocalStorage();
    this.router.navigate(['']);
  }

  public isAuthenticated() {
    return this.httpClient.get(
      `${this.url}/auth/${this.getTokenFromLocalStorage()}`
    );
  }
}
