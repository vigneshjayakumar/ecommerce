import { Component, inject, OnInit } from '@angular/core';
import { InvoiceService, TViewInvoiceDetailsRes } from '../invoice.service';
import { EMPTY, map, Subscription, switchMap, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-invoice-details',
  imports: [],
  templateUrl: './view-invoice-details.component.html',
  styleUrl: './view-invoice-details.component.css',
})
export class ViewInvoiceDetailsComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
  private activatedRoute = inject(ActivatedRoute);

  private subsArr: Subscription[] = [];

  invoiceDetails!: TViewInvoiceDetailsRes['response'];

  ngOnInit(): void {
    this.fetchInvoiceDetails();
  }

  private fetchInvoiceDetails() {
    const subs = this.activatedRoute.paramMap
      .pipe(
        map((params) => params.get('id')),
        switchMap((id) => {
          if (id) {
            return this.invoiceService.fetchInvoiceDetailsById(+id);
          }
          return EMPTY;
        }),
        tap((invoiceDetails) => (this.invoiceDetails = invoiceDetails.response))
      )
      .subscribe((details) => console.log('DETAILS', details));
    this.subsArr.push(subs);
  }
}
