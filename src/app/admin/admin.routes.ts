import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AllProductsListComponent } from './all-products-list/all-products-list.component';
import { CreateNewEditProductComponent } from './create-new-edit-product/create-new-edit-product.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'products-list',
        component: AllProductsListComponent,
      },
      {
        path: 'create-new',
        component: CreateNewEditProductComponent,
      },
      {
        path: 'edit/:id',
        component: CreateNewEditProductComponent,
      },
      {
        path: '**',
        redirectTo: 'products-list',
      },
    ],
  },
];
