# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Manngo J&K** is an Angular 20 web application for inventory and business management. It serves both a landing page and an administrative dashboard for managing products, clients, sales, expenses, and inventory.

## Development Commands

- **Start development server**: `ng serve` or `npm start`
- **Build for production**: `ng build`
- **Build for development**: `ng build --configuration development`
- **Watch mode**: `ng build --watch --configuration development`
- **Run tests**: `ng test`
- **Run single test file**: `ng test --include='**/*.spec.ts'`

The application runs on `http://localhost:4200/` in development mode.

**Note**: No lint or typecheck commands are configured in package.json. Consider adding ESLint and TypeScript checking commands for code quality.

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

- **SCSS Architecture**: Uses SCSS with component-scoped styles following a "Global-First" approach
- **Global utilities**: Defined in `src/styles/_components.scss` - always check for existing classes before writing component styles
- **Design tokens**: All values (colors, spacing, etc.) defined in `src/styles/_variables.scss` - never use hardcoded values
- **Global styles**: Main entry point at `src/styles.scss`
- **Icons**: FontAwesome icons integrated via `@fortawesome/angular-fontawesome`

**Key principles from Cursor rules**:
- Always use design tokens from `_variables.scss` instead of hardcoded values
- Leverage global utility classes from `_components.scss` before writing component-specific styles
- Component SCSS files should be minimal and only for truly unique layouts

## API Integration

- All HTTP services extend from base patterns
- Error handling via `ErrorInterceptor`  
- Loading states managed via `LoadingInterceptor`
- RESTful API conventions followed

## Testing

- Uses Jasmine and Karma for unit testing
- Test files follow `*.spec.ts` naming convention
- Run tests with `ng test`
- Test files already exist for most services in the features structure

## Code Standards (from Cursor Rules)

**Angular Best Practices**:
- Use standalone components (default behavior in Angular 20)
- Use signals for state management with `computed()` for derived state
- Use `input()` and `output()` functions instead of decorators
- Set `changeDetection: ChangeDetectionStrategy.OnPush` for all components
- Use native control flow (`@if`, `@for`, `@switch`) instead of structural directives
- Use `inject()` function instead of constructor injection
- Use `providedIn: 'root'` for singleton services

**TypeScript Standards**:
- Use strict type checking (avoid `any`, prefer `unknown`)
- Prefer type inference when obvious
- Use reactive forms over template-driven forms