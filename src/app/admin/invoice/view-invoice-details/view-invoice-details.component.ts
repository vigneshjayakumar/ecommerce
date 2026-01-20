import { Component, inject, OnInit } from '@angular/core';
import { EMPTY, map, Observable, switchMap, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe, DatePipe, NgClass } from '@angular/common';

import {
  InvoiceService,
  TMerchantInfo,
  TViewInvoiceDetailsRes,
} from '../invoice.service';

@Component({
  selector: 'app-view-invoice-details',
  imports: [AsyncPipe, DatePipe, NgClass],
  templateUrl: './view-invoice-details.component.html',
  styleUrl: './view-invoice-details.component.css',
})
export class ViewInvoiceDetailsComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
  private activatedRoute = inject(ActivatedRoute);

  invoiceDetails!: TViewInvoiceDetailsRes['response'];
  invoiceDetailsObs: Observable<TViewInvoiceDetailsRes> =
    this.activatedRoute.paramMap.pipe(
      map((params) => params.get('id')),
      switchMap((id) => {
        if (id) {
          return this.invoiceService.fetchInvoiceDetailsById(+id);
        }
        return EMPTY;
      }),
      tap((invoiceDetails) => (this.invoiceDetails = invoiceDetails.response)),
    );
  merchantInfo!: TMerchantInfo;
  ngOnInit(): void {
    this.invoiceService
      .fetchMerchentDetails()
      .subscribe((res) => (this.merchantInfo = res));
  }
}
