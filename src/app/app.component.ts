import { Component, inject, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { tap } from 'rxjs/internal/operators/tap';

import { AuthService } from './auth/auth.service';
import { LoaderComponent } from './common/loader/loader.component/loader.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterOutlet, LoaderComponent],
})
export class AppComponent implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private subs?: Subscription;

  isMenuOpen = false;

  isUserLoggedIn = false;
  isUserSubs = this.authService.accessTokenObs
    .pipe(tap((user) => (this.isUserLoggedIn = !!user)))
    .subscribe();

  constructor() {
    this.authService.refreshAccessToken().subscribe();
  }

  onUserLogin() {
    this.isMenuOpen = false;
    this.router.navigate(['/login'], { queryParams: { authPage: 'login' } });
  }

  onUserLogout() {
    this.subs = this.authService
      .logOut()
      .subscribe(() => (this.isUserLoggedIn = !!this.authService.Access_token));
  }
  onMenuOpen() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onRouteTo(path: string) {
    this.isMenuOpen = false;
    this.router.navigate([path]);
  }
  ngOnDestroy(): void {
    if (this.subs) this.subs.unsubscribe();
    if (this.isUserSubs) this.isUserSubs.unsubscribe();
  }
}
