import { Routes } from '@angular/router';

import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';
import { InvoiceComponent } from './invoice.component';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';

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
        path: 'invoice-lists',
        component: InvoiceListComponent,
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
