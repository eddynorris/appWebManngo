import { Routes } from '@angular/router';

export const PRODUCCION_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'produccion',
    pathMatch: 'full'
  },
  {
    path: 'produccion',
    loadComponent: () => import('./pages/produccion-page.component'),
    data: { title: 'Gestión de Producción' }
  },
  {
    path: 'recetas',
    loadComponent: () => import('./pages/recetas-list-page/recetas-list-page.component'),
    data: { title: 'Gestión de Recetas' }
  },
  {
    path: 'recetas/new',
    loadComponent: () => import('./pages/recetas-form-page/recetas-form-page.component'),
    data: { title: 'Nueva Receta' }
  },
  {
    path: 'recetas/edit/:id',
    loadComponent: () => import('./pages/recetas-form-page/recetas-form-page.component'),
    data: { title: 'Editar Receta' }
  }
];
