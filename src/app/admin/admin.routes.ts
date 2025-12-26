import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AllProductsListComponent } from './all-products-list/all-products-list.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'products-list',
        component: AllProductsListComponent,
      },
    ],
  },
];
