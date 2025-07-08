import { Routes } from '@angular/router';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/clientes-list-page/clientes-list-page.component'),
    data: { title: 'Clientes' }
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/cliente-form-page/cliente-form-page.component'),
    data: { title: 'Nuevo Cliente' }
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/cliente-form-page/cliente-form-page.component'),
    data: { title: 'Editar Cliente' }
  }
];
