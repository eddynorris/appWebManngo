import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

/**
 * Rutas del módulo administrativo
 * Todas las rutas excepto login están protegidas por authGuard
 */
export const ADMIN_ROUTES: Routes = [
  // =============================================================================
  // AUTHENTICATION
  // =============================================================================
  {
    path: 'login',
    loadComponent: () => import('./users/pages/login-page/login-page.component'),
    data: { title: 'Iniciar Sesión' }
  },

  // =============================================================================
  // PROTECTED ADMIN ROUTES
  // =============================================================================
  {
    path: '',
    loadComponent: () => import('./components/admin-layout/admin-layout.component'),
    canActivate: [authGuard],
    children: [
      // ---------------------------------------------------------------------------
      // DASHBOARD & ANALYTICS
      // ---------------------------------------------------------------------------
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/pages/dashboard-page/dashboard-page.component'),
        data: { title: 'Dashboard - Deuda de Clientes' }
      },
      {
        path: 'proyecciones',
        loadComponent: () => import('./dashboard/pages/proyecciones-page.component/proyecciones-page.component'),
        data: { title: 'Proyecciones de Ventas' }
      },
      {
        path: 'proyecciones/:id',
        loadComponent: () => import('./dashboard/pages/proyecciones-page-detail.component/proyecciones-page-detail.component').then(m => m.ProyeccionesPageDetailComponent),
        data: { title: 'Detalle de Proyección' }
      },
      {
        path: 'reporte-unificado',
        loadComponent: () => import('./dashboard/pages/reporte-unificado/reporte-unificado-page.component'),
        data: { title: 'Reporte Unificado' }
      },

      // ---------------------------------------------------------------------------
      // OPERATIONAL MODULES
      // ---------------------------------------------------------------------------
      {
        path: 'pedidos',
        loadChildren: () => import('./pedidos/pedidos.routes').then(m => m.PEDIDOS_ROUTES),
        data: { title: 'Gestión de Pedidos' }
      },
      {
        path: 'ventas',
        loadChildren: () => import('./ventas/ventas.routes').then(m => m.VENTAS_ROUTES),
        data: { title: 'Gestión de Ventas' }
      },
      {
        path: 'pagos',
        loadChildren: () => import('./pagos/pagos.routes').then(m => m.pagosRoutes),
        data: { title: 'Gestión de Pagos' }
      },
      {
        path: 'gastos',
        loadChildren: () => import('./gastos/gastos.routes').then(m => m.GASTOS_ROUTES),
        data: { title: 'Gestión de Gastos' }
      },

      // ---------------------------------------------------------------------------
      // CUSTOMER RELATIONSHIP
      // ---------------------------------------------------------------------------
      {
        path: 'clientes',
        loadChildren: () => import('./clientes/clientes.routes').then(m => m.CLIENTES_ROUTES),
        data: { title: 'Gestión de Clientes' }
      },
      {
        path: 'proveedores',
        loadChildren: () => import('./proveedores/proveedores.routes').then(m => m.proveedoresRoutes),
        data: { title: 'Gestión de Proveedores' }
      },

      // ---------------------------------------------------------------------------
      // INVENTORY MANAGEMENT
      // ---------------------------------------------------------------------------
      {
        path: 'inventarios',
        loadChildren: () => import('./inventarios/inventarios.routes').then(m => m.INVENTARIOS_ROUTES),
        data: { title: 'Gestión de Inventarios' }
      },
      {
        path: 'lotes',
        loadChildren: () => import('./lotes/lotes.routes').then(m => m.LOTES_ROUTES),
        data: { title: 'Gestión de Lotes' }
      },

      // ---------------------------------------------------------------------------
      // REPORTS
      // ---------------------------------------------------------------------------
      {
        path: 'reportes',
        loadChildren: () => import('./reportes/reportes.routes').then(m => m.REPORTES_ROUTES),
        data: { title: 'Reportes y Análisis' }
      },

      // ---------------------------------------------------------------------------
      // PRODUCTION
      // ---------------------------------------------------------------------------
      {
        path: 'produccion',
        loadChildren: () => import('./produccion/produccion.routes').then(m => m.PRODUCCION_ROUTES),
        data: { title: 'Gestión de Producción' }
      },

      // ---------------------------------------------------------------------------
      // ADMINISTRATION
      // ---------------------------------------------------------------------------
      {
        path: 'users',
        loadChildren: () => import('./users/users.routes').then(m => m.USERS_ROUTES),
        data: { title: 'Gestión de Usuarios' }
      },
      {
        path: 'products',
        loadChildren: () => import('./productos/productos.routes').then(m => m.PRODUCTOS_ROUTES),
        data: { title: 'Gestión de Productos' }
      },
      {
        path: 'presentaciones',
        loadChildren: () => import('./presentaciones/presentaciones.routes').then(m => m.presentacionesRoutes),
        data: { title: 'Gestión de Presentaciones' }
      },

      // ---------------------------------------------------------------------------
      // DEFAULT ROUTE
      // ---------------------------------------------------------------------------
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];

