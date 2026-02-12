import { Component, inject, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, MatOption } from '@angular/material/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs/internal/operators/tap';
import { catchError, EMPTY, of, switchMap } from 'rxjs';
import { DashboardApiService } from './services/dashboard-api.service';
import { INRCurrency } from '../common/pipes/inr-currency.pipe';
import { MatSelectModule } from '@angular/material/select';
import { SalesChartsComponent } from './sales-charts/sales-charts.component';
import { StockChartsComponent } from './stock-charts/stock-charts.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatOption,
    ReactiveFormsModule,
    MatSelectModule,
    INRCurrency,
    SalesChartsComponent, StockChartsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private dashboardApiService = inject(DashboardApiService);

  stockSummaryList: TStockSummaryRes['response'] = [];
  invoiceSummaryList: TInvoiceSummary['response']['data'] = [];
  invoiceSummaryOverall: TInvoiceSummary['response']['summary'] = {
    invoiceCount: 0,
    totalSales: 0,
  };

  today = new Date();

  startDate: Date = new Date(this.today);
  endDate: Date = new Date();
  paymentFilter: TpaymentStatus = 'DRAFT';

  dateRangeForm = new FormGroup({
    start: new FormControl(this.startDate),
    end: new FormControl(this.endDate),
  });
  filterSelect = new FormControl(this.paymentFilter);

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

  ngOnInit(): void {
    this.startDate.setDate(this.today.getDate() - 30);
    this.dashboardApiService
      .getStockReport()
      .pipe(
        tap((res) => (this.stockSummaryList = res)),
        switchMap(() => this.fetchSalesReport()),
      )
      .subscribe();
  }
  private fetchSalesReport() {
    const payload: { start: string; end: string; paymentStatus: string } = {
      start: this.startDate.toISOString(),
      end: this.endDate.toISOString(),
      paymentStatus: this.paymentFilter,
    };
    console.log(payload);
    return this.dashboardApiService.getSalesReport(payload).pipe(
      tap((res) => {
        this.invoiceSummaryList = res.data;
        this.invoiceSummaryOverall = res.summary;
      }),
      catchError((err) => {
        console.log('ERROR', err);
        return of({});
      }),
    );
  }
}

type TpaymentStatus = 'ALL' | 'PAID' | 'CANCELLED' | 'DRAFT';

export type TStockSummaryRes = {
  message: string;
  response: {
    productId: number;
    productName: string;
    availableQty: number;
    lowStock: boolean;
  }[];
};

export type TInvoiceSummary = {
  message: string;
  response: {
    summary: {
      invoiceCount: number;
      totalSales: number;
    };
    data: {
      period: string;
      invoiceCount: number;
      totalSales: number;
    }[];
  };
};
