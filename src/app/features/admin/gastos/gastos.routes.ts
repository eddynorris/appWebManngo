import { Routes } from '@angular/router';

export const GASTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/gastos-list-page/gastos-list-page.component'),
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/gasto-form-page/gasto-form-page.component'),
    data: { isEdit: false },
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/gasto-form-page/gasto-form-page.component'),
    data: { isEdit: true },
  },
];
