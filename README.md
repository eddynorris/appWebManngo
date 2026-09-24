# Manngo J&K (App Manngo Web)

Aplicación web de gestión comercial de Manngo J&K: panel administrativo para controlar ventas, pedidos, inventario, lotes, almacenes, producción (recetas), clientes, proveedores, pagos, gastos y reportes. Incluye una landing page pública con catálogo de productos y recetas.

## Características principales

- Landing page pública con presentación, productos, recetas, beneficios y testimonios.
- Login y panel de administración (admin) con layout propio.
- Gestión de clientes, proveedores, productos y presentaciones.
- Ventas con selección de productos y modal de detalle.
- Pedidos, pagos (con cierre de caja y depósitos) y gastos.
- Inventario, lotes, almacenes y transferencias entre almacenes.
- Producción con recetas y registro de insumos.
- Dashboard con proyecciones de clientes y reportes de producción.
- Reportes financieros, de inventario (global y por lote) y unificados.
- Módulo de chat flotante para soporte.
- Persistencia de datos vía API (`api.manngojk.com`).

## Tecnologías

- Angular 20
- RxJS
- Font Awesome
- Material Icons
- jwt-decode (autenticación)
- xlsx (exportación Excel)
- TypeScript

## Requisitos previos

- Node.js 18 o superior
- Angular CLI (`npm install -g @angular/cli`)

## Cómo ejecutar

```bash
npm install
ng serve
```

El servidor de desarrollo estará disponible en `http://localhost:4200/`.

## Compilar

```bash
ng build
```

## Pruebas

```bash
ng test
```

## Estructura del proyecto

```
src/app/
├── core/          # Guards, interceptores, servicios y utilidades
├── features/
│   ├── landing/       # Página pública de presentación
│   └── admin/         # Panel administrativo
│       ├── ventas/        # Ventas
│       ├── pedidos/       # Pedidos
│       ├── clientes/      # Clientes
│       ├── proveedores/   # Proveedores
│       ├── productos/     # Productos
│       ├── presentaciones/ # Presentaciones
│       ├── inventarios/   # Inventario
│       ├── lotes/         # Lotes
│       ├── almacenes/     # Almacenes
│       ├── produccion/    # Producción y recetas
│       ├── pagos/         # Pagos y cierre de caja
│       ├── gastos/        # Gastos
│       ├── dashboard/     # Dashboard y proyecciones
│       ├── reportes/      # Reportes
│       ├── users/         # Usuarios y login
│       ├── config/        # Configuración
│       └── chat/          # Chat de soporte
├── shared/        # Componentes, directivas, pipes y servicios compartidos
└── types/         # Tipos TypeScript
```