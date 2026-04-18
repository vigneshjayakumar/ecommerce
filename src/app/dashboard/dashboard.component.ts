import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs/internal/operators/tap';
import { catchError, EMPTY, of, Subscription, switchMap } from 'rxjs';

import { DashboardApiService } from './services/dashboard-api.service';
import { BranchWiseService } from '../branch-wise/branch-wise.service';
import { Router } from '@angular/router';
import { InvoiceService, TInvoiceListEle } from '../admin/invoice/invoice.service';
import { INRCurrency } from '../common/pipes/inr-currency.pipe';
import { DatePipe } from '@angular/common';
import { TableComponent } from '../ui/shared/components/table/table.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    ReactiveFormsModule, TableComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  providers: [DatePipe, INRCurrency]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardApiService = inject(DashboardApiService);
  private branchService = inject(BranchWiseService);
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);
  private datePipe = inject(DatePipe);
  private INRCurrency = inject(INRCurrency);

  private subs: Subscription[] = [];

  branchList: { id: number, name: string }[] = [];
  invoiceList: TInvoiceListEle[] = [];
  productsTableColumn: { key: string, label: string }[] = [
    { key: 'invoiceId', label: 'Invoice ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'amt', label: 'Amount' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' },
  ];

  productTableRows: { [key: number]: { col: string, value: string }[] }[] = []

  insightsCardsList = [
    {
      label: 'Total Revenue',
      icon: 'assets/icons/total-revenue.svg',
      data: '₹1,00,000',
      trends: {
        icon: 'assets/icons/trending-up.svg',
        trendsValue: '12%'
      }
    },
    {
      label: 'Paid Invoice',
      icon: 'assets/icons/paid-invoices.svg',
      data: '350',
    },
    {
      label: 'Pending Invoices',
      icon: 'assets/icons/pending-invoice.svg',
      data: '48',
    },
    {
      label: 'Failed Payments',
      icon: 'assets/icons/failed-payment.svg',
      data: '6',
    },
  ]


  private mapDataIntoTableRows = (schProductList: TInvoiceListEle[]) => {
    this.productTableRows = [];
    schProductList.forEach((ele, i) => {
      const tempEle = {
        [i]: [
          { col: 'invoice_number', value: ele.invoice_number },
          { col: 'customer_name', value: ele.customer_name },
          { col: 'total_amount', value: ele.total_amount, formatter: (value: string) => this.INRCurrency.transform(value) },
          { col: 'date', value: ele.created_at.toString().split('T')[0], formatter: (value: any) => this.datePipe.transform(value, 'mediumDate') },
          { col: 'status', value: ele.invoice_status, class: this.activeClass(ele.invoice_status), formatter: (value: string) => (value[0].toUpperCase() + value.substring(1).toLowerCase()) }
        ]
      }
      this.productTableRows.push(tempEle)
    })
  }
  private activeClass(status: "DRAFT" | "PAID" | "CANCELLED" | "CONFIRMED") {
    let styleClass = 'bm-chip-success';
    if (status === 'DRAFT') styleClass = 'bm-chip-netural';
    if (status === 'CONFIRMED') styleClass = 'bm-chip-warning';
    if (status === 'CANCELLED') styleClass = 'bm-chip-danger';
    return styleClass
  }
  private fetchInvoiceList() {
    const sub = this.invoiceService.fetchInvoiceLists()
      .pipe(tap(res => this.mapDataIntoTableRows(res)))
      .subscribe();
    this.subs.push(sub);
  }

  // New Dashboard 2.0 refactoring ending.


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
    this.fetchInvoiceList();
    const sub = this.branchService.getBranchList().pipe(
      tap(res => this.branchList = res.map(ele => ({ id: +ele.id, name: ele.branch_name })))
    ).subscribe();
    this.subs.push(sub);

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

  onRouteTo(path: '/admin/invoice/create-invoice' | '/admin/create-new' | '/invoice/invoice-lists') {
    this.router.navigate([path])
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => {
      if (sub) sub.unsubscribe()
    })
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
