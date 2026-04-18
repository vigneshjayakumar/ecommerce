import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/internal/operators/tap';
import { Subscription } from 'rxjs/internal/Subscription';

import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-bm-header',
  imports: [],
  templateUrl: './bm-header.component.html',
  styleUrl: './bm-header.component.css'
})
export class BmHeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private subs?: Subscription;

  isUserLoggedIn = false;
  isUserSubs = this.authService.accessTokenObs
    .pipe(tap((user) => (this.isUserLoggedIn = !!user)))
    .subscribe();

  onUserLogin() {
    this.router.navigate(['/login'], { queryParams: { authPage: 'login' } });
  }

  onUserLogout() {
    this.subs = this.authService
      .logOut()
      .subscribe(() => (this.isUserLoggedIn = !!this.authService.Access_token));
  }

  onRouteTo(path: string) {
    console.log('PATH',path)
    this.router.navigate([path]);
  }
  ngOnDestroy(): void {
    if (this.subs) this.subs.unsubscribe();
    if (this.isUserSubs) this.isUserSubs.unsubscribe();
  }
}
