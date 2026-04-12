import { Routes } from '@angular/router';

import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';
import { InvoiceComponent } from './invoice.component';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { ViewInvoiceDetailsComponent } from './view-invoice-details/view-invoice-details.component';
import { ExchangeSoldComponent } from './exchange-sold/exchange-sold.component';

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
        path: 'invoice-details/:id',
        component: ViewInvoiceDetailsComponent,
      },
      {
        path: 'exchange/:invoiceId',
        component: ExchangeSoldComponent
      },
      {
        path: '',
        redirectTo: 'invoice-lists',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'invoice-lists',
      },
    ],
  },
];
