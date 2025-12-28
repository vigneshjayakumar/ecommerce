import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from './auth.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthInterceptor implements HttpInterceptor {
//   constructor(private authService: AuthService) {}
//   intercept(
//     req: HttpRequest<any>,
//     next: HttpHandler
//   ): Observable<HttpEvent<any>> {
//     const token = this.authService.Access_token;
//     console.log('Token From Interceptor', token);
//     if (!token) return next.handle(req);
//     const authRequest = req.clone({
//       setHeaders: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return next.handle(authRequest);
//   }
// }

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.Access_token;
  if (!token) return next(req);
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
  return next(authReq);
};
