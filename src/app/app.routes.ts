import { Routes } from '@angular/router';

import { AdminLoginComponent } from './auth/admin-login/admin-login.component';

export const appRoutes: Routes = [
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.routes').then((m) => m.adminRoutes),
  },
  {
    path: 'login',
    component: AdminLoginComponent,
  },
  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'admin',
  },
];
