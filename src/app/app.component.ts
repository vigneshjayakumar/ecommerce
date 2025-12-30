import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { tap } from 'rxjs/internal/operators/tap';

import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterOutlet, RouterLink],
})
export class AppComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isUserLoggedIn = false;
  isUserSubs = this.authService.accessTokenObs
    .pipe(tap((user) => (this.isUserLoggedIn = !!user)))
    .subscribe();

  constructor() {
    this.authService.refreshAccessToken().subscribe();
  }

  onUserLogin() {
    this.router.navigate(['/login'], { queryParams: { authPage: 'login' } });
  }

  onUserLogout() {
    this.authService
      .logOut()
      .subscribe(() => (this.isUserLoggedIn = !!this.authService.Access_token));
  }
}
