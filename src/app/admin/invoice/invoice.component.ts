import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-invoice',
  imports: [RouterOutlet],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.css',
})
export class InvoiceComponent {
  private router = inject(Router);

  onRoute(path: 'create-invoice') {
    this.router.navigate(['/admin/invoice/', path]);
  }
}
