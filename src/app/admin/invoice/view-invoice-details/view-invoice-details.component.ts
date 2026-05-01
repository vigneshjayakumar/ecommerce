import { Component, inject } from '@angular/core';
import { EMPTY, map, Observable, switchMap, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncPipe, DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';

import {
  InvoiceService,
  TMerchantInfo,
  TViewInvoiceDetailsRes,
} from '../invoice.service';
import { INRCurrency } from 'src/app/common/pipes/inr-currency.pipe';
import { FormsModule } from '@angular/forms';
import { ExchangeSoldComponent } from '../exchange-sold/exchange-sold.component';
import { PaymentConfirmationPopupComponent, TPaymentOptions } from 'src/app/common/components/payment-confirmation-popup/payment-confirmation-popup.component';

@Component({
  selector: 'app-view-invoice-details',
  imports: [
    AsyncPipe,
    DatePipe,
    NgClass,
    INRCurrency, TitleCasePipe,
    FormsModule, ExchangeSoldComponent, PaymentConfirmationPopupComponent
  ],
  templateUrl: './view-invoice-details.component.html',
  styleUrl: './view-invoice-details.component.css',
})
export class ViewInvoiceDetailsComponent {
  private invoiceService = inject(InvoiceService);
  private activatedRoute = inject(ActivatedRoute);
  private clipboard = inject(Clipboard);
  private router = inject(Router);

  showSharePanelPopup = false;
  pdfLinkStr: null | string = null;
  waURL = '';

  showPaymentPopUp = false;
  popupData = { title: 'Payment Confirmation', showCancelBtn: true, showConfirmBtn: true, amount: 0 };

  showWatsAppDialog = false;
  sharePhoneNumber: string = '';
  shareEmailId: string = '';
  showWatsAppShare = false;
  showReturnorExchange = false;

  showEmailPopUp = false;
  emailModalData = {
    title: 'Customer Email',
    showCancelBtn: true,
    showConfirmBtn: true,
    isEmail: true,
    isShare: false,
  };
  sharePDFLinkConfig = {
    title: 'Share Pdf',
    showCancelBtn: true,
    showConfirmBtn: true,
    isEmail: false,
    isShare: true,
  };
  invoiceDetails!: TViewInvoiceDetailsRes['response'];
  invoiceId!: string;
  invoiceDetailsObs: Observable<any> = this.activatedRoute.paramMap.pipe(
    map((params) => params.get('id')),
    switchMap((id) => {
      if (id) {
        this.invoiceId = id;
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
  onEmailTrigger(
  ) {
    this.invoiceService
      .shareInvoicePdfViaEmail({
        email: this.shareEmailId,
        invoiceId: this.invoiceDetails.overAll.id,
      })
      .subscribe((res) => {
        this.showEmailPopUp = false;
      });
  }


  onDownloadPDF() {
    this.invoiceService
      .createInvoicePdf(this.invoiceDetails.overAll.id)
      .subscribe((res) => {
        window.open(res.response, '_self');
      });
  }

  markAsPaid() {
    this.popupData.amount = +this.invoiceDetails.overAll.total_amount
    this.showPaymentPopUp = true;
  }

  onMarkAsPayTrigger(event: { paymentType: TPaymentOptions, amount: number, refId?: string } | false) {
    if (event) {
      const payload = { paymentType: event.paymentType, amount: event.amount, refId: event.refId };
      this.invoiceService.markAsPaid(+this.invoiceId, payload).pipe(
        switchMap(() =>
          this.invoiceService.fetchInvoiceDetailsById(+this.invoiceId!)),
        tap((invoiceDetails) => (this.invoiceDetails = invoiceDetails.response)),
        switchMap(() => this.fetchMerchantDetails()),
      ).subscribe()
    }
    this.showPaymentPopUp = false;
  }
  onPDFLink() {
    this.invoiceService
      .generateLink(this.invoiceDetails.overAll.id)
      .subscribe((res) => {
        this.pdfLinkStr = res.response;
        this.showWatsAppShare = true;
      });
  }

  private fetchMerchantDetails() {
    return this.invoiceService
      .fetchMerchentDetails()
      .pipe(tap((res) => (this.merchantInfo = res)));
  }

  onSendToWatsApp() {
    this.waURL = `https://wa.me/${this.sharePhoneNumber}?text=${this.pdfLinkStr}`;
    const waAnchorTag = document.getElementById(
      'waAnchor',
    ) as HTMLAnchorElement;
    waAnchorTag.click();

  }

  onConfirmInvoice() {
    if (!this.invoiceId) return;
    this.invoiceService.confirmInvoiceById(+this.invoiceId)
      .pipe(
        switchMap(() =>
          this.invoiceService.fetchInvoiceDetailsById(+this.invoiceId!)),
        tap((invoiceDetails) => (this.invoiceDetails = invoiceDetails.response)),
        switchMap(() => this.fetchMerchantDetails()),
      ).subscribe();
  }

  onCancelInvoice() {
    if (!this.invoiceId) return;
    this.invoiceService
      .onCancelInvoice(+this.invoiceId)
      .pipe(
        switchMap(() =>
          this.invoiceService.fetchInvoiceDetailsById(+this.invoiceId!)),
        tap((invoiceDetails) => (this.invoiceDetails = invoiceDetails.response)),
        switchMap(() => this.fetchMerchantDetails()),
      ).subscribe();
  }

  onCopyClipboard() {
    this.clipboard.copy(this.pdfLinkStr ?? '');
  }

  onShareTrigger(
    event:
      | { type: 'copy' | 'watsapp'; phoneNumber?: string }
      | { status: boolean; email?: string },
  ) {
    if ('status' in event) {
      if (!event.status) {
        this.showSharePanelPopup = false;
      }
    } else {
      if (event.type === 'copy') {
        this.clipboard.copy(this.pdfLinkStr ?? '');
      } else {
        this.waURL = `https://wa.me/${event.phoneNumber}?text=${this.pdfLinkStr}`;
        const waAnchorTag = document.getElementById(
          'waAnchor',
        ) as HTMLAnchorElement;
        waAnchorTag.click();
      }
    }
  }

  onRouteTo(path: 'exchange' | 'create-invoice' | 'invoice-lists', invoiceId: string | null = null) {
    if (invoiceId) {
      this.router.navigate(['/admin/invoice/', path, this.invoiceId]);
    } else {
      this.router.navigate(['/admin/invoice/', path]);
    }
  }
}
