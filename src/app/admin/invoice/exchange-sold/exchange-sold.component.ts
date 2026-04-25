import { Component, inject, Input, OnInit } from '@angular/core';
import { tap } from 'rxjs/internal/operators/tap';
import { FormsModule } from '@angular/forms';

import { InvoiceService, TViewInvoiceDetailsRes } from '../invoice.service';

@Component({
  selector: 'app-exchange-sold',
  imports: [FormsModule],
  templateUrl: './exchange-sold.component.html',
  styleUrl: './exchange-sold.component.css'
})
export class ExchangeSoldComponent implements OnInit {
  private invoiceService = inject(InvoiceService);

  @Input({ required: true }) invoiceId!: string;

  invoiceDetails: TViewInvoiceDetailsRes['response']['items'] = [];
  payloadItems: { invoiceItemId: number, quantity: number, ogQuantity: number }[] = [];

  ngOnInit(): void {
    this.invoiceService.fetchInvoiceDetailsById(+this.invoiceId).pipe(
      tap((invoiceDetails) => (this.invoiceDetails = invoiceDetails.response.items)),
      tap((invoiceDetails) => this.mapPayloadItemsWithInvoiceDetails(invoiceDetails))
    ).subscribe();
  }


  onPostSalesReturn() {
    if (!this.invoiceId) return; // throw error that invoice id is not present.
    const payloadValidation = this.payloadItems.map(ele => {
      if (+ele.quantity > +ele.ogQuantity) {
        return (`${ele.quantity} is higher than ${ele.ogQuantity}`)
      }
      return
    }).filter(ele => !!ele)

    if (payloadValidation.length) {
      return;
    }
    const payload = {
      invoiceId: this.invoiceId,
      items: this.payloadItems.filter(ele => ele.quantity > 0)
    }
    if (!payload.items.length) return;
    this.invoiceService.onPostSalesReturn(payload).subscribe()
  }

  private mapPayloadItemsWithInvoiceDetails(invoiceDetails: TViewInvoiceDetailsRes) {
    this.payloadItems = invoiceDetails.response.items.map(ele => ({ invoiceItemId: ele.id, quantity: 0, ogQuantity: ele.quantity }))
  }
}
