import { Routes } from '@angular/router';

export const presentacionesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/presentaciones-list-page/presentaciones-list-page.component')
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/presentacion-form-page/presentacion-form-page.component')
  },
  {
    path: ':id/view',
    loadComponent: () => import('./pages/presentacion-form-page/presentacion-form-page.component')
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/presentacion-form-page/presentacion-form-page.component')
  }
];