import { Routes } from '@angular/router';

export const VENTAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/ventas-list-page/ventas-list-page.component'),
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/venta-form-page/venta-form-page.component'),
    data: { isEdit: false },
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/venta-form-page/venta-form-page.component'),
    data: { isEdit: true },
  },
];
