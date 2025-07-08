import { Routes } from '@angular/router';

export const PEDIDOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/pedidos-list-page/pedidos-list-page.component'),
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/pedido-form-page/pedido-form-page.component'),
    data: { isEdit: false },
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/pedido-form-page/pedido-form-page.component'),
    data: { isEdit: true },
  },
];
