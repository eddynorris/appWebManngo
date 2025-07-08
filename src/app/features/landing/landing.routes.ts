import { Route } from '@angular/router';
import { HomePage } from './pages/home.page';

// Rutas base para el módulo landing
export const LANDING_ROUTES: Route[] = [
  {
    path: '',
    component: HomePage
  }
];
