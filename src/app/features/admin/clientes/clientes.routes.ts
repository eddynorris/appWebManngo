import { Routes } from '@angular/router';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/clientes-list-page/clientes-list-page.component')
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/cliente-form-page/cliente-form-page.component')
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/cliente-form-page/cliente-form-page.component')
  },
];
