import { Component, inject } from '@angular/core';
import { EMPTY, map, Observable, switchMap, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe } from '@angular/common';

import { InvoiceService, TViewInvoiceDetailsRes } from '../invoice.service';

@Component({
  selector: 'app-view-invoice-details',
  imports: [AsyncPipe],
  templateUrl: './view-invoice-details.component.html',
  styleUrl: './view-invoice-details.component.css',
})
export class ViewInvoiceDetailsComponent {
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
}
