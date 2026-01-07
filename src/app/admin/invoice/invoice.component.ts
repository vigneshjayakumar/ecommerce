import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';

@Component({
  selector: 'app-invoice',
  imports: [CreateInvoiceComponent],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.css',
})
export class InvoiceComponent {
  private router = inject(Router);

  onRoute(path: 'create-invoice') {
    this.router.navigate(['/admin/invoice/', path]);
  }
}
