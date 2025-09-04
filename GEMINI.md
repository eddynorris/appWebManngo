# Project Overview

This is a web application built with Angular 20 for Manngo J&K. It appears to be an administration dashboard for managing business operations, including inventory, sales, customers, and more. The application has a public-facing landing page and a protected admin area.

**Key Technologies:**

*   **Framework:** Angular 20
*   **Language:** TypeScript
*   **Styling:** SCSS
*   **Package Manager:** npm (or yarn, since a `yarn.lock` file is present)

**Architecture:**

*   The application is structured into "features," with separate modules for the `landing` page and the `admin` section.
*   The `admin` section is protected by an authentication guard (`auth.guard.ts`).
*   Routing is handled by the Angular Router, with lazy loading for feature modules to improve performance.
*   The project uses a component-based architecture, with shared components for UI elements like buttons, modals, and spinners.

# Building and Running

**Development Server:**

To start a local development server, run:

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

**Build:**

To build the project for production, run:

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

**Testing:**

To run unit tests, use the following command:

```bash
ng test
```

# Development Conventions

*   **Styling:** The project uses SCSS for styling. Global styles are defined in `src/styles.scss`, and component-specific styles are co-located with their components.
*   **Routing:** Routes are defined in separate `*.routes.ts` files for each feature module.
*   **State Management:** The method for state management is not immediately obvious from the file structure, but it may be handled within services or a dedicated state management library like NgRx (though it's not listed as a dependency).
*   **Authentication:** Authentication is handled via an `AuthService` and an `AuthGuard`. The `auth.interceptor.ts` likely adds authentication tokens to outgoing HTTP requests.
