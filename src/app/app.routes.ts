import { Routes } from '@angular/router';

import { AdminLoginComponent } from './auth/admin-login/admin-login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TransferProductsComponent } from './transfer-products/transfer-products.component';

export const appRoutes: Routes = [
  { path: 'dashboard', component: DashboardComponent },

  { path: 'admin', loadChildren: () => import('./admin/admin.routes').then((m) => m.adminRoutes) },
  { path: 'branch', loadChildren: () => import('./branch-wise/branch.routes').then(m => m.branchwiseRoutes) },
  { path: 'transfer/products', component: TransferProductsComponent },
  { path: 'login', component: AdminLoginComponent },

  { path: '', redirectTo: 'admin', pathMatch: 'full' },
  { path: '**', redirectTo: 'admin' },
];
