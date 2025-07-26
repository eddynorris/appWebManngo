# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Manngo J&K** is an Angular 20 web application for inventory and business management. It serves both a landing page and an administrative dashboard for managing products, clients, sales, expenses, and inventory.

## Development Commands

- **Start development server**: `ng serve` or `npm start`
- **Build for production**: `ng build`
- **Build for development**: `ng build --configuration development`
- **Watch mode**: `ng watch`
- **Run tests**: `ng test`

The application runs on `http://localhost:4200/` in development mode.

## Architecture

### Route Structure
- **Landing**: `/landing` - Public marketing site with product showcase
- **Admin**: `/admin` - Protected administrative dashboard
- **Default**: Redirects to `/landing`

### Feature-Based Architecture
The application follows Angular's feature-based architecture:

```
src/app/
├── core/           # Singleton services, guards, interceptors
├── features/       # Feature modules (landing, admin)
├── shared/         # Reusable components, pipes, directives
└── types/          # TypeScript type definitions
```

### Admin Features
- **Dashboard**: Overview with client debt tracking
- **Clientes**: Customer management
- **Productos**: Product catalog management  
- **Inventarios**: Stock management with adjustment tracking
- **Ventas**: Sales transactions and reporting
- **Pedidos**: Order management
- **Gastos**: Expense tracking
- **Pagos**: Payment processing
- **Reportes**: Inventory and business reports
- **Users**: User account management

### Key Services
- **AuthService**: JWT-based authentication with role-based access (`admin`, `usuario`, `almacenero`)
- **LoadingService**: Global loading state management
- **NotificationService**: Toast notifications
- All business logic is organized in feature-specific services

### Shared Components
- **DataTableComponent**: Generic table with sorting, actions, and custom cell rendering
- **ModalComponent**: Reusable modal dialogs
- **PaginationComponent**: Table pagination
- **ButtonComponent**: Consistent button styling
- **SpinnerComponent**: Loading indicators

## Environment Configuration

- **Development**: Uses `src/environments/environment.development.ts` 
- **Production**: Uses `src/environments/environment.prod.ts`
- **API Proxy**: Development requests to `/api` are proxied to `https://api.manngojk.lat` via `proxy.conf.json`

## Authentication & Authorization

- JWT tokens stored in sessionStorage
- Role-based access control with `AuthGuard`
- Auth interceptor handles token attachment
- Supports roles: `admin`, `usuario`, `almacenero`

## Styling

- Uses SCSS with component-scoped styles
- Global styles in `src/styles.scss`
- Component variables in `src/styles/_variables.scss`
- FontAwesome icons integrated via `@fortawesome/angular-fontawesome`

## API Integration

- All HTTP services extend from base patterns
- Error handling via `ErrorInterceptor`  
- Loading states managed via `LoadingInterceptor`
- RESTful API conventions followed

## Testing

- Uses Jasmine and Karma for unit testing
- Test files follow `*.spec.ts` naming convention
- Run tests with `ng test`