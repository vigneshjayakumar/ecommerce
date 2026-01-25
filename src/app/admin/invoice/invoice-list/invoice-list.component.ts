import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { InvoiceService, TGetInvoiceLists } from '../invoice.service';
import {
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { DatePipe, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { INRCurrency } from 'src/app/common/pipes/inr-currency.pipe';

@Component({
  selector: 'app-invoice-list',
  imports: [NgClass, DatePipe, ReactiveFormsModule, INRCurrency],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.css',
})
export class InvoiceListComponent implements OnInit, OnDestroy {
  private invoiceService = inject(InvoiceService);
  private router = inject(Router);

  searchControl = new FormControl();
  filterControl = new FormControl();

  invoiceSubs?: Subscription;
  searchChangeSubs = this.searchControl.valueChanges
    .pipe(
      debounceTime(500),
      tap((searchTerm) => {
        this.filterControl.setValue('all', { emitEvent: false });
        if (searchTerm) {
          this.searchFilterList = this.invoiceDataList.filter(
            (ele) =>
              ele.customer_name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              ele.invoice_number
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
          );
          return this.searchFilterList;
        }
        this.searchFilterList = this.invoiceDataList;
        return this.searchFilterList;
      }),
    )
    .subscribe();

  filterControlSubs = this.filterControl.valueChanges
    .pipe(
      distinctUntilChanged(),
      tap((filterTerm) => {
        if (filterTerm && filterTerm !== 'all') {
          this.searchFilterList = this.invoiceDataList.filter((ele) =>
            ele.invoice_status.toLowerCase().includes(filterTerm.toLowerCase()),
          );
          return this.searchFilterList;
        }
        this.searchControl.setValue('', { emitEvent: false });
        this.searchFilterList = this.invoiceDataList;
        return this.searchFilterList;
      }),
    )
    .subscribe();

  searchFilterList: TGetInvoiceLists['response']['data'] = [];
  invoiceDataList: TGetInvoiceLists['response']['data'] = [];
  ngOnInit(): void {
    this.fetchInvoiceList().subscribe();
  }
  onViewDetails(id: number) {
    this.router.navigate(['/admin/invoice/invoice-details/', id]);
  }
  onCancelInvoice(id: number) {
    this.invoiceSubs = this.invoiceService
      .onCancelInvoice(id)
      .pipe(
        tap((res) => console.log(res)),
        switchMap((res) => {
          if (res.message === 'SUCCESS') {
            return this.fetchInvoiceList();
          }
          return EMPTY;
        }),
      )
      .subscribe();
  }
  private fetchInvoiceList() {
    return this.invoiceService.fetchInvoiceLists().pipe(
      tap((res) => {
        this.invoiceDataList = res;
        this.searchFilterList = this.invoiceDataList;
      }),
    );
  }

  onRoute(path: 'create-invoice' | 'invoice-lists') {
    this.router.navigate(['/admin/invoice/', path]);
  }

  ngOnDestroy(): void {
    if (this.filterControlSubs) this.filterControlSubs.unsubscribe();
    if (this.searchChangeSubs) this.searchChangeSubs.unsubscribe();
    if (this.invoiceSubs) this.invoiceSubs.unsubscribe();
  }
}
