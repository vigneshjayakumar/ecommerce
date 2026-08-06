import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from './auth.service';
import { LoaderService } from '../common/loader/loader.service';
import { catchError, finalize, tap, throwError } from 'rxjs';
import { ToasterService } from '../common/services/toaster.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const toaster = inject(ToasterService);
  const authService = inject(AuthService);
  const loaderService = inject(LoaderService);

  const token = authService.Access_token;
  const request = token
    ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })
    : req;

  const getErrorMessage = (err: HttpErrorResponse) => {
    if (err.status === 0) return 'Network error';
    // if (err.status === 401) return 'Unauthorized access';
    if (err.status === 403) return 'Access denied';
    if (err.status === 404) return 'API not found';
    if (err.status >= 500) return 'Internal server error';

    if (err.error && typeof err.error === 'object') {
      const errorBody = err.error as { message?: string; errorMsg?: string | string[] };
      
      if (Array.isArray(errorBody.errorMsg)) return errorBody.errorMsg.join(', ');
      if (errorBody.message) return errorBody.message;
      if (errorBody.errorMsg) return errorBody.errorMsg;
    }

    if (typeof err.error === 'string') return err.error;

    return 'Something went wrong';
  };

  loaderService.showLoader();

  return next(request).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const body: any = event.body;
        if (body?.message === 'ERROR') {
          const errorMessage = Array.isArray(body.errorMsg) ? body.errorMsg.join(', ') : body.errorMsg;
          toaster.error(errorMessage || 'Something went wrong');
        }
      }
    }),
    catchError((err: HttpErrorResponse) => {
      toaster.error(getErrorMessage(err));
      return throwError(() => err);
    }),
    finalize(() => loaderService.hideLoader())
  );
};
