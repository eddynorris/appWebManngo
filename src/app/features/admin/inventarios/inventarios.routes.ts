import { Routes } from '@angular/router';

export const INVENTARIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/inventarios-page/inventarios-page.component'),
  },
  {
    path: 'transferencias',
    loadComponent: () => import('./pages/transferencias/transferencias-page.component'),
  },
];
