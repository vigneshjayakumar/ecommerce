import { Routes } from '@angular/router';

import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';
import { InvoiceComponent } from './invoice.component';

export const InvoiceRoutes: Routes = [
  {
    path: '',
    component: InvoiceComponent,
    children: [
      {
        path: 'create-invoice',
        component: CreateInvoiceComponent,
      },
      {
        path: '',
        redirectTo: 'create-invoice',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'create-invoice',
      },
    ],
  },
];
