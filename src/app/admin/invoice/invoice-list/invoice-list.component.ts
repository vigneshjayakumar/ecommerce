import { Component, inject, OnInit } from '@angular/core';
import { InvoiceService, TGetInvoiceLists } from '../invoice.service';
import { tap } from 'rxjs';
import { DatePipe, NgClass } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invoice-list',
  imports: [NgClass, DatePipe],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.css',
})
export class InvoiceListComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
  private router = inject(Router);

  invoiceDataList: TGetInvoiceLists['response']['data'] = [];
  ngOnInit(): void {
    this.invoiceService
      .fetchInvoiceLists()
      .pipe(tap((res) => (this.invoiceDataList = res)))
      .subscribe();
  }
  onViewDetails(id: number) {
    this.router.navigate(['/admin/invoice/invoice-details/', id]);
    console.log('ID');
  }
  onCancelInvoice(id: number) {
    this.invoiceService
      .onCancelInvoice(id)
      .pipe(tap((res) => console.log(res)))
      .subscribe();
  }
}
