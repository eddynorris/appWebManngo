import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

// Rutas base para el módulo admin
export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./users/pages/login-page/login-page.component'),
  },
  {
    path: '',
    loadComponent: () => import('./components/admin-layout/admin-layout.component'),
    canActivate: [authGuard], // Protege todas las rutas hijas
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/pages/dashboard-page/dashboard-page.component'),
        data: { title: 'Dashboard' }
      },
      {
        path: 'proyecciones',
        loadComponent: () => import('./dashboard/pages/proyecciones-page.component/proyecciones-page.component'),
        data: { title: 'Proyecciones de Clientes' }
      },
      {
        path: 'proyecciones/:id',
        loadComponent: () => import('./dashboard/pages/proyecciones-page-detail.component/proyecciones-page-detail.component').then(m => m.ProyeccionesPageDetailComponent),
        data: { title: 'Detalle de Proyección' }
      },
      {
        path: 'products',
        loadChildren: () => import('./productos/productos.routes').then(m => m.PRODUCTOS_ROUTES),
        data: { title: 'Productos' }
      },
      {
        path: 'clientes',
        loadChildren: () => import('./clientes/clientes.routes').then(m => m.CLIENTES_ROUTES),
        data: { title: 'Clientes' }
      },
      {
        path: 'inventarios',
        loadChildren: () => import('./inventarios/inventarios.routes').then(m => m.INVENTARIOS_ROUTES),
        data: { title: 'Inventarios' }
      },
      {
        path: 'ventas',
        loadChildren: () => import('./ventas/ventas.routes').then(m => m.VENTAS_ROUTES),
        data: { title: 'Ventas' }
      },
      {
        path: 'pagos',
        loadChildren: () => import('./pagos/pagos.routes').then(m => m.PAGOS_ROUTES),
        data: { title: 'Pagos' }
      },
      {
        path: 'gastos',
        loadChildren: () => import('./gastos/gastos.routes').then(m => m.GASTOS_ROUTES),
        data: { title: 'Gastos' }
      },
      {
        path: 'users',
        loadChildren: () => import('./users/users.routes').then(m => m.USERS_ROUTES),
        data: { title: 'Usuarios' }
      },
      {
        path: 'pedidos',
        loadChildren: () => import('./pedidos/pedidos.routes').then(m => m.PEDIDOS_ROUTES),
        data: { title: 'Pedidos' }
      },
      {
        path: 'reportes',
        loadChildren: () => import('./reportes/reportes.routes').then(m => m.REPORTES_ROUTES),
        data: { title: 'Reportes' }
      },
      {
        path: 'lotes',
        loadChildren: () => import('./lotes/lotes.routes').then(m => m.LOTES_ROUTES),
        data: { title: 'Lotes' }
      },
      {
        path: 'proveedores',
        loadChildren: () => import('./proveedores/proveedores.routes').then(m => m.proveedoresRoutes),
        data: { title: 'Proveedores' }
      },
      {
        path: 'presentaciones',
        loadChildren: () => import('./presentaciones/presentaciones.routes').then(m => m.presentacionesRoutes),
        data: { title: 'Presentaciones' }
      },
      {
        path: 'produccion',
        loadChildren: () => import('./produccion/produccion.routes').then(m => m.PRODUCCION_ROUTES),
        data: { title: 'Producción' }
      },

      {
        path: '',
        redirectTo: 'dashboard', // Redirige /admin a /admin/dashboard por defecto
        pathMatch: 'full',
      },
    ],
  },
];
