import { Component, inject, OnInit } from '@angular/core';
import { EMPTY, map, Observable, switchMap, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe, DatePipe, NgClass } from '@angular/common';

import {
  InvoiceService,
  TMerchantInfo,
  TViewInvoiceDetailsRes,
} from '../invoice.service';
import { CustomPopupModalComponent } from 'src/app/common/components/custom-popup-modal/custom-popup-modal.component';

@Component({
  selector: 'app-view-invoice-details',
  imports: [AsyncPipe, DatePipe, NgClass, CustomPopupModalComponent],
  templateUrl: './view-invoice-details.component.html',
  styleUrl: './view-invoice-details.component.css',
})
export class ViewInvoiceDetailsComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
  private activatedRoute = inject(ActivatedRoute);

  showEmailPopUp = false;
  emailModalData = {
    title: 'Customer Email',
    showCancelBtn: true,
    showConfirmBtn: true,
    isEmail: true,
  };
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
  onEmailPDF() {
    this.showEmailPopUp = true;
  }
  onEmailTrigger(event: { status: boolean; email?: string }) {
    if (!event.status) {
      this.showEmailPopUp = false;
    }
    if (event.status && event?.email !== '' && event?.email) {
      this.invoiceService
        .shareInvoicePdfViaEmail({
          email: event.email,
          invoiceId: this.invoiceDetails.overAll.id,
        })
        .subscribe((res) => {
          this.showEmailPopUp = false;
        });
    }
  }
  onDownloadPDF() {
    this.invoiceService
      .createInvoicePdf(this.invoiceDetails.overAll.id)
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'invoice.pdf';
        a.click();

        window.URL.revokeObjectURL(url);
      });
  }
}
