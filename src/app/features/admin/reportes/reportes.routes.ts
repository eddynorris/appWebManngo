import { Routes } from '@angular/router';

export const REPORTES_ROUTES: Routes = [
  {
    path: 'reporte-inventario-por-lote',
    loadComponent: () => import('./pages/reporte-inventario-por-lote/reporte-inventario-por-lote-page.component'),
  },
  {
    path: 'reporte-inventario-global',
    loadComponent: () => import('./pages/reporte-inventario-global/reporte-inventario-global-page.component'),
  },
  {
    path: 'reporte-financiero',
    loadComponent: () => import('./pages/reporte-financiero/reporte-financiero-page.component'),
  },
];
