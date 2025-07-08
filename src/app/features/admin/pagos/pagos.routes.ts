import { Routes } from '@angular/router';

export const PAGOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/pagos-list-page/pagos-list-page.component'),
    title: 'Gestión de Pagos'
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/pago-form-page/pago-form-page.component'),
    title: 'Registrar Pago'
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/pago-form-page/pago-form-page.component'),
    title: 'Editar Pago'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
