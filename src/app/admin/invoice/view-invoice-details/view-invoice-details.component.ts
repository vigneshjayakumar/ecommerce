import { Component, inject } from '@angular/core';
import { EMPTY, map, Observable, switchMap, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe, DatePipe, NgClass } from '@angular/common';

import {
  InvoiceService,
  TMerchantInfo,
  TViewInvoiceDetailsRes,
} from '../invoice.service';
import { CustomPopupModalComponent } from 'src/app/common/components/custom-popup-modal/custom-popup-modal.component';
import { INRCurrency } from 'src/app/common/pipes/inr-currency.pipe';

@Component({
  selector: 'app-view-invoice-details',
  imports: [
    AsyncPipe,
    DatePipe,
    NgClass,
    CustomPopupModalComponent,
    INRCurrency,
  ],
  templateUrl: './view-invoice-details.component.html',
  styleUrl: './view-invoice-details.component.css',
})
export class ViewInvoiceDetailsComponent {
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
  invoiceDetailsObs: Observable<any> = this.activatedRoute.paramMap.pipe(
    map((params) => params.get('id')),
    switchMap((id) => {
      if (id) {
        return this.invoiceService.fetchInvoiceDetailsById(+id);
      }
      return EMPTY;
    }),
    tap((invoiceDetails) => (this.invoiceDetails = invoiceDetails.response)),
    switchMap(() => this.fetchMerchantDetails()),
  );
  merchantInfo!: TMerchantInfo;

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

  private fetchMerchantDetails() {
    return this.invoiceService
      .fetchMerchentDetails()
      .pipe(tap((res) => (this.merchantInfo = res)));
  }
}
