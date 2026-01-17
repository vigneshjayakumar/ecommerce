import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from './auth.service';
import { LoaderService } from '../common/loader/loader.service';
import { finalize } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const loaderService = inject(LoaderService);
  const token = authService.Access_token;
  loaderService.showLoader();
  if (!token) return next(req).pipe(finalize(()=>loaderService.hideLoader()));
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
  return next(authReq).pipe(finalize(() => loaderService.hideLoader()));
};
