import { Routes } from '@angular/router';

export const PRODUCTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/products-list-page/products-list-page.component'),
    data: { title: 'Productos' }
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/product-form-page/product-form-page.component'),
    data: { title: 'Nuevo Producto' }
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/product-form-page/product-form-page.component'),
    data: { title: 'Editar Producto' }
  }
];
