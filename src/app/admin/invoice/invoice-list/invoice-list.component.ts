import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { InvoiceService, TGetInvoiceLists, TInvoiceListEle } from '../invoice.service';
import {
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { INRCurrency } from 'src/app/common/pipes/inr-currency.pipe';
import { PaymentConfirmationPopupComponent, TPaymentOptions } from 'src/app/common/components/payment-confirmation-popup/payment-confirmation-popup.component';
import { TableComponent, TActionBtnConfig, TActionButtonTriggers } from 'src/app/ui/shared/components/table/table.component';
import { BmPaginationComponent } from 'src/app/ui/shared/components/bm-pagination/bm-pagination.component';

@Component({
  selector: 'app-invoice-list',
  imports: [TableComponent, BmPaginationComponent, ReactiveFormsModule, PaymentConfirmationPopupComponent],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.css',
  providers: [DatePipe, INRCurrency]
})
export class InvoiceListComponent implements OnInit, OnDestroy {
  private invoiceService = inject(InvoiceService);
  private router = inject(Router);
  private datePipe = inject(DatePipe);
  private INRCurrency = inject(INRCurrency);

  showPaymentPopUp = false;
  popupData = { title: 'Payment Confirmation', showCancelBtn: true, showConfirmBtn: true, amount: 0 };
  invoiceId!: number;

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
          this.mapDataIntoTableRows(this.searchFilterList);
          return this.searchFilterList;
        }
        this.searchFilterList = this.invoiceDataList;
        this.mapDataIntoTableRows(this.searchFilterList);
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
          this.mapDataIntoTableRows(this.searchFilterList);
          return this.searchFilterList;
        }
        this.searchControl.setValue('', { emitEvent: false });
        this.searchFilterList = this.invoiceDataList;
        this.mapDataIntoTableRows(this.searchFilterList);
        return this.searchFilterList;
      }),
    )
    .subscribe();


  // Table dumb component data.
  btnConfig: Partial<TActionBtnConfig> = { viewBtn: true, cancelBtn: true, payNowBtn: true, pdfDownload: true }
  productsTableColumn: { key: string, label: string }[] = [
    { key: 'sno', label: 'S.No' },
    { key: 'customer_name', label: 'Customer Name' },
    { key: 'invoice_number', label: 'Invoice Number' },
    { key: 'date', label: 'Date' },
    { key: 'sub_total', label: 'Sub Total' },
    { key: 'tax', label: 'Tax Amount' },
    { key: 'total_amount', label: 'Total Amount' },
    { key: 'status', label: 'Status' },
  ]

  productTableRows: { [key: number]: { col: string, value: string }[] }[] = [];
  onTableAction(event: { action: TActionButtonTriggers, id: number }) {
    const index = event.id;
    const item = this.searchFilterList[index]
    console.log()
    switch (event.action) {
      case 'viewBtn':
        if (item && item.id) {
          this.onViewDetails(item.id)
        }
        break;
      case 'cancelBtn':
        break;
      case 'pdfDownload':
        break;
      case 'payNowBtn':
        if (item) {
          this.markAsPaid(item)
        }
        break;
    }
  }


  private mapDataIntoTableRows = (schProductList: TGetInvoiceLists['response']['data']) => {
    this.productTableRows = [];
    schProductList.forEach((ele, i) => {
      const tempEle = {
        [i]: [
          { col: 'sno', value: (i + 1).toString() },
          { col: 'customer_name', value: ele.customer_name },
          { col: 'invoice_number', value: ele.invoice_number },
          { col: 'date', value: ele.created_at.toString().split('T')[0], formatter: (value: any) => this.datePipe.transform(value, 'mediumDate') },
          { col: 'sub_total', value: ele.subtotal, formatter: (value: string) => this.INRCurrency.transform(value) },
          { col: 'tax', value: ele.tax_amount, formatter: (value: string) => this.INRCurrency.transform(value) },
          { col: 'total_amount', value: ele.total_amount, formatter: (value: string) => this.INRCurrency.transform(value) },
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
  //ending table data

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

  markAsPaid(element: TInvoiceListEle) {
    this.popupData.amount = +element.total_amount
    this.showPaymentPopUp = true;
    this.invoiceId = element.id;
  }

  onMarkAsPayTrigger(event: { paymentType: TPaymentOptions, amount: number, refId?: string } | false) {
    if (event) {
      const payload = { paymentType: event.paymentType, amount: event.amount, refId: event.refId };
      this.invoiceService.markAsPaid(this.invoiceId, payload).subscribe()
    }
    this.showPaymentPopUp = false;
  }
  private fetchInvoiceList() {
    return this.invoiceService.fetchInvoiceLists().pipe(
      tap((res) => {
        this.invoiceDataList = res;
        this.searchFilterList = this.invoiceDataList;
        this.mapDataIntoTableRows(this.searchFilterList);
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
