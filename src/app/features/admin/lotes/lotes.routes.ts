import { Routes } from '@angular/router';

export const LOTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/lotes-list-page/lotes-list-page.component'),
    title: 'Lotes - Manngo J&K'
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/lote-form-page/lote-form-page.component'),
    title: 'Nuevo Lote - Manngo J&K'
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/lote-form-page/lote-form-page.component'),
    title: 'Ver Lote - Manngo J&K',
    data: { mode: 'view' }
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/lote-form-page/lote-form-page.component'),
    title: 'Editar Lote - Manngo J&K',
    data: { mode: 'edit' }
  }
];