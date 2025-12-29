import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { AuthService } from './auth/auth.service';
import { tap } from 'rxjs/internal/operators/tap';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterOutlet, RouterLink],
})
export class AppComponent {
  private authService = inject(AuthService);
  isUserLoggedIn = false;
  isUserSubs = this.authService.accessTokenObs
    .pipe(
      tap((user) => {
        console.log('USER LOGIN', user);
        this.isUserLoggedIn = !!user;
      })
    )
    .subscribe();
  constructor(private router: Router) {
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
