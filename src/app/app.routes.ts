import { Routes } from '@angular/router';

import { AdminLoginComponent } from './auth/admin-login/admin-login.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const appRoutes: Routes = [
  { path: 'dashboard', component: DashboardComponent },

  { path: 'admin', loadChildren: () => import('./admin/admin.routes').then((m) => m.adminRoutes) },
  { path: 'branch', loadChildren: () => import('./branch-wise/branch.routes').then(m => m.branchwiseRoutes) },
  { path: 'stocks', loadChildren: () => import('./stocks/stocks.routes').then(m => m.stockRoutes) },
  { path: 'login', component: AdminLoginComponent },

  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
