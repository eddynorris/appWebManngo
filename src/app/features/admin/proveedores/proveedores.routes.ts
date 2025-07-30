import { Routes } from '@angular/router';

export const proveedoresRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/proveedores-list-page/proveedores-list-page.component')
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/proveedor-form-page/proveedor-form-page.component')
  },
  {
    path: ':id/view',
    loadComponent: () => import('./pages/proveedor-form-page/proveedor-form-page.component')
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/proveedor-form-page/proveedor-form-page.component')
  }
];