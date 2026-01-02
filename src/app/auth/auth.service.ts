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
    return this.httpClient.post<TPostSignupRes>(
      `${environment.localURL}/user/signup`,
      payload
    );
  }

  postLogin(email: string, password: string) {
    const payload: Omit<TSignUpPayload, 'confirmPassword'> = {
      email: email,
      password: password,
    };
    return this.httpClient
      .post<TPostLoginRes>(`${environment.localURL}/user/login`, payload, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this.updateAccessToken(res.response.accessToken);
          if (res.response.accessToken) {
            this.router.navigate(['/admin']);
          }
        })
      );
  }

  refreshAccessToken() {
    return this.httpClient
      .post<Omit<TPostLoginRes, 'message'>>(
        `${environment.localURL}/user/refresh`,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap((res) => {
          this.updateAccessToken(res.response.accessToken);
        })
      );
  }

  get Access_token(): string | null {
    return this.accessToken;
  }

  logOut() {
    return this.httpClient
      .post(
        `${environment.localURL}/user/logout`,
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

  postRegisterUser(userDetails: TRegisterUserDetails) {
    return this.httpClient.post(
      `${environment.localURL}/user/registerUser`,
      userDetails,
      { withCredentials: true }
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
  response: {
    accessToken: string;
  };
};

type TPostSignupRes = {
  message: string;
  response: {
    newUser?: boolean;
    infoMessage?: string;
  };
};

type TRegisterUserDetails = TSignUpPayload & {
  userName: string;
  phoneNumber: string;
};
