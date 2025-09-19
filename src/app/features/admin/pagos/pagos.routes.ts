import { Routes } from '@angular/router';

export const pagosRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/pagos-list-page/pagos-list-page.component')
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./pages/pago-form-page/pago-form-page.component')
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('./pages/pago-form-page/pago-form-page.component')
  },
  {
    path: 'cierre-caja',
    loadComponent: () => import('./pages/cierre-caja-page/cierre-caja-page.component')
  },
  {
    path: 'depositos',
    loadComponent: () => import('./pages/deposito-page/deposito-page.component')
  },
  {
    path: '**',
    redirectTo: ''
  }
];
