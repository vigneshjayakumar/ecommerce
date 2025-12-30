import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiHttpService {
  private httpClient = inject(HttpClient);
  private router = inject(Router);

  private stitchAPIEndPoint(
    baseURL: string,
    endPoint: string,
    params?: string[]
  ) {
    let paramsUrl = '';
    if (params?.length) {
      params.forEach((ele, i) => {
        if (i < params.length) {
          paramsUrl = paramsUrl + ele + '/';
        } else {
          paramsUrl = paramsUrl + ele;
        }
      });
    }
    let path = baseURL + '/' + endPoint;
    if (paramsUrl !== '') {
      path = path + '/' + paramsUrl;
    }
    return path;
  }

  apiHttp<BT, RT, QT>(
    method: 'get' | 'post',
    baseURL: string,
    endPoint: string,
    params: string[],
    payLoad?: BT,
    query?: QT
  ): Observable<RT> {
    const path = this.stitchAPIEndPoint(baseURL, endPoint, params);
    switch (method) {
      case 'get':
        return this.httpClient
          .get<RT>(path)
          .pipe(catchError(this.httpErrorHandler));
      case 'post':
        return this.httpClient
          .post<RT>(path, payLoad)
          .pipe(catchError(this.httpErrorHandler));
    }
  }

  private httpErrorHandler(httpError: HttpErrorResponse) {
    const status = httpError.status;
    let errMsg = 'Unexpected error Occured.';
    switch (status) {
      case 401:
        this.router.navigate(['/login'], {
          queryParams: { authPage: 'login' },
        });
        errMsg = 'User session Expired';
        break;
    }
    return throwError(() => new Error(errMsg));
  }
}
