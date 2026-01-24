import { Component, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs/internal/operators/tap';
import { catchError, EMPTY, of, switchMap, throwError } from 'rxjs';
import { DashboardApiService } from './services/dashboard-api.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    ReactiveFormsModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private dashboardApiService = inject(DashboardApiService);

  dateRangeForm = new FormGroup({
    start: new FormControl(''),
    end: new FormControl(''),
  });
  filterSelect = new FormControl('All');

  startDate: Date = new Date();
  endDate: Date = new Date();
  paymentFilter: TpaymentStatus = 'ALL';

  dateChangeSubs = this.dateRangeForm.controls['end'].valueChanges
    .pipe(
      switchMap((res) => {
        const start = this.dateRangeForm.controls['start'].value ?? '';
        if (res && start) {
          this.startDate = new Date(start);
          this.endDate = new Date(res);
          return this.fetchSalesReport();
        }
        return EMPTY;
      }),
    )
    .subscribe();

  paymentFilterChangeSubs = this.filterSelect.valueChanges
    .pipe(
      switchMap((filterTerm) => {
        if (filterTerm) {
          this.paymentFilter = filterTerm as TpaymentStatus;
          return this.fetchSalesReport();
        }
        return EMPTY;
      }),
    )
    .subscribe();

  private fetchSalesReport() {
    const payload: { start: string; end: string; paymentStatus: string } = {
      start: this.startDate.toISOString(),
      end: this.endDate.toISOString(),
      paymentStatus: this.paymentFilter,
    };
    console.log(payload);
    return this.dashboardApiService.getSalesReport(payload).pipe(
      catchError((err) => {
        console.log('ERROR', err);
        return of({});
      }),
    );
  }
}

type TpaymentStatus = 'ALL' | 'PAID' | 'CANCELLED' | 'DRAFT';
