import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/internal/operators/tap';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private accessToken: string | null = null;
  private accessTokenListener = new BehaviorSubject<typeof this.accessToken>(
    this.accessToken
  );
  public readonly accessTokenObs = this.accessTokenListener.asObservable();

  private httpClient = inject(HttpClient);
  private router = inject(Router);

  postSignUp(email: string, password: string, confirmPassword: string) {
    const payload: TSignUpPayload = {
      email: email,
      password: password,
      confirmPassword: confirmPassword,
    };
    return this.httpClient
      .post(`${environment.localURL}/login/signup`, payload)
      .pipe(
        tap(() =>
          this.router.navigate(['/login'], {
            queryParams: { authPage: 'login' },
          })
        )
      );
  }

  postLogin(email: string, password: string) {
    const payload: Omit<TSignUpPayload, 'confirmPassword'> = {
      email: email,
      password: password,
    };
    return this.httpClient
      .post<TPostLoginRes>(`${environment.localURL}/login/login`, payload, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this.updateAccessToken(res.accessToken);
          this.router.navigate(['/admin']);
        })
      );
  }

  refreshAccessToken() {
    return this.httpClient
      .post<Omit<TPostLoginRes, 'message'>>(
        `${environment.localURL}/login/refresh`,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap((res) => {
          this.updateAccessToken(res.accessToken);
        })
      );
  }

  get Access_token(): string | null {
    return this.accessToken;
  }

  logOut() {
    return this.httpClient
      .post(
        `${environment.localURL}/login/logout`,
        {},
        { withCredentials: true }
      )
      .pipe(
        tap(() => {
          this.updateAccessToken(null);
          this.router.navigate(['/login'], {
            queryParams: { authPage: 'login' },
          });
        })
      );
  }

  private updateAccessToken(status: string | null) {
    this.accessToken = status;
    this.accessTokenListener.next(this.accessToken);
  }
}

type TSignUpPayload = {
  email: string;
  password: string;
  confirmPassword: string;
};

type TPostLoginRes = {
  message: string;
  accessToken: string;
};
