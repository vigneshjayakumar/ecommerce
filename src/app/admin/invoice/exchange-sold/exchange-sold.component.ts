import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { AsyncPipe } from '@angular/common';
import { tap } from 'rxjs/internal/operators/tap';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/internal/operators/map';
import { switchMap } from 'rxjs/internal/operators/switchMap';

import { InvoiceService, TViewInvoiceDetailsRes } from '../invoice.service';

@Component({
  selector: 'app-exchange-sold',
  imports: [AsyncPipe, FormsModule],
  templateUrl: './exchange-sold.component.html',
  styleUrl: './exchange-sold.component.css'
})
export class ExchangeSoldComponent {
  private activatedRoute = inject(ActivatedRoute);
  private invoiceService = inject(InvoiceService);

  private invoiceId: string | null = null;

  invoiceDetails: TViewInvoiceDetailsRes['response']['items'] = [];
  payloadItems: { invoiceItemId: number, quantity: number, ogQuantity: number }[] = [];

  invoiceDetailsObs: Observable<any> = this.activatedRoute.paramMap.pipe(
    map((params) => params.get('invoiceId')),
    switchMap((id) => {
      if (id) {
        this.invoiceId = id;
        return this.invoiceService.fetchInvoiceDetailsById(+id);
      }
      return EMPTY;
    }),
    tap((invoiceDetails) => (this.invoiceDetails = invoiceDetails.response.items)),
    tap((invoiceDetails) => this.mapPayloadItemsWithInvoiceDetails(invoiceDetails))
  );

  onPostSalesReturn() {
    if (!this.invoiceId) return; // throw error that invoice id is not present.
    const payloadValidation = this.payloadItems.map(ele => {
      if (+ele.quantity > +ele.ogQuantity) {
        return (`${ele.quantity} is higher than ${ele.ogQuantity}`)
      }
      return
    }).filter(ele => !!ele)

    if (payloadValidation.length) {
      console.log('Validation failed', payloadValidation);
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
