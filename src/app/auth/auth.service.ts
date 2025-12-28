import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs/internal/operators/tap';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private accessToken: string | null = null;

  private httpClient = inject(HttpClient);

  postSignUp(email: string, password: string, confirmPassword: string) {
    const payload: TSignUpPayload = {
      email: email,
      password: password,
      confirmPassword: confirmPassword,
    };
    return this.httpClient.post(
      `${environment.localURL}/login/signup`,
      payload
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
      .pipe(tap((res) => (this.accessToken = res.accessToken)));
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
      .pipe(tap((res) => (this.accessToken = res.accessToken)));
  }

  set Access_token(accessToken: string) {
    this.accessToken = accessToken;
  }
  get Access_token(): string | null {
    return this.accessToken;
  }
  clearAccessToken() {
    this.accessToken = null;
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
