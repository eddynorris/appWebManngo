import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/users-list-page/users-list-page.component'),
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/user-form-page/user-form-page.component'),
    data: { isEdit: false },
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/user-form-page/user-form-page.component'),
    data: { isEdit: true },
  },
];
