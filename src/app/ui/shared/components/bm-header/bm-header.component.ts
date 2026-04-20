import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, switchMap } from 'rxjs';
import { tap } from 'rxjs/internal/operators/tap';
import { Subscription } from 'rxjs/internal/Subscription';
import { InvoiceService } from 'src/app/admin/invoice/invoice.service';

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
  private invoiceService = inject(InvoiceService);
  private subs?: Subscription;

  isUserLoggedIn = false;
  isUserSubs = this.authService.accessTokenObs
    .pipe(tap((user) => (this.isUserLoggedIn = !!user))).pipe(switchMap((user) => {
      if (!!user) {
        return this.fetchMerchantDetails()
      }
      return EMPTY
    }))
    .subscribe();

  merchantDetails = {
    name: '',
    address: '',
    state: '',
    pincode: ''
  }
  private fetchMerchantDetails() {
    return this.invoiceService.fetchMerchentDetails().pipe(tap(res => {
      this.merchantDetails = {
        name: res.tenant_name,
        address: res.address,
        state: res.state,
        pincode: res.pincode.toString()
      }
    }))
  }

  onUserLogin() {
    this.router.navigate(['/login'], { queryParams: { authPage: 'login' } });
  }

  onUserLogout() {
    this.subs = this.authService
      .logOut()
      .subscribe(() => (this.isUserLoggedIn = !!this.authService.Access_token));
  }

  onRouteTo(path: string) {
    console.log('PATH', path)
    this.router.navigate([path]);
  }
  ngOnDestroy(): void {
    if (this.subs) this.subs.unsubscribe();
    if (this.isUserSubs) this.isUserSubs.unsubscribe();
  }
}
