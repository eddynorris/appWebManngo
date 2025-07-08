# Plan de Desarrollo: App Manngo Web

Este plan describe los pasos secuenciales para construir la aplicación, desde la configuración inicial hasta el despliegue, siguiendo las mejores prácticas de Angular.

---

## **Fase 1: Configuración del Esqueleto del Proyecto** ✅

> ✅ Fase completada: Se creó la estructura de carpetas y archivos base. Rutas principales con lazy loading. Módulos `landing` y `admin` creados.

---

## **Fase 2: Desarrollo de la Landing Page (Pública)** ✅

> ✅ Fase completada: Landing page funcional con diseño profesional, responsive y con todas las secciones planificadas.

---

## **Fase 3: Configuración de Autenticación y Guards** ✅

> ✅ Fase completada: Sistema de autenticación funcional con servicio, guardián de rutas, interceptor HTTP y página de login. Rutas de admin protegidas.

---

## **Fase 4: Desarrollo del Módulo Admin (Productos)** ✅

> ✅ Fase completada: Se ha desarrollado el layout principal del panel administrativo y el módulo completo de gestión de productos con funcionalidad CRUD y un formulario dinámico para gestionar el producto y sus presentaciones.

1.  **Crear Dashboard Principal:** ✅
    *   AdminLayoutComponent con navegación lateral y header.
    *   DashboardPageComponent con métricas y resumen del sistema.

2.  **Módulo de Productos:** ✅
    *   Servicio `ProductService` con métodos CRUD.
    *   `ProductsListPageComponent` con búsqueda.
    *   `ProductFormPageComponent` con formulario reactivo para crear/editar productos y sus **presentaciones dinámicas**.
    *   Tipos TypeScript unificados en `contract.types.ts`.
    *   Rutas configuradas con lazy loading.

---

## **Fase 5: Refactorización y Componentes Reutilizables** ✅

> ✅ Fase completada: Se han unificado los tipos de datos y se ha creado un componente de tabla reutilizable para estandarizar la visualización de datos en todos los módulos de gestión.

1.  **Unificar Tipos de Datos:** ✅
    *   Se eliminó `product.types.ts` y se estableció `contract.types.ts` como única fuente de verdad.
    *   Se refactorizó el módulo de productos para usar los tipos correctos.

2.  **Crear Tabla Reutilizable:** ✅
    *   Se creó un componente genérico `DataTableComponent` en `shared/components`.
    *   La tabla es configurable mediante inputs (`data`, `columns`, `actions`).
    *   Emite eventos para las acciones (`edit`, `delete`, etc.).
    *   Maneja estados de carga y vacío.

3.  **Refactorizar Módulo de Productos:** ✅
    *   Se actualizó `ProductsListPageComponent` para usar el nuevo `DataTableComponent`, simplificando drásticamente su plantilla y lógica.

---

## **Fase 6: Desarrollo de Módulos de Gestión (CRUDs)** ⏳

> ⏳ Fase en progreso: Implementando los módulos de gestión para Clientes, Ventas, Usuarios y más, utilizando el nuevo componente de tabla reutilizable y formularios dinámicos.

1.  **Módulo de Clientes:** ⏳
    *   Servicio `ClienteService` creado.
    *   Componentes `ClientesListPageComponent` y `ClienteFormPageComponent` existen.
    *   Falta: Confirmar integración total con `DataTableComponent` y navegación completa.

2.  **Módulo de Ventas:** ⏳
    *   Servicio `VentaService` creado.
    *   Componentes `VentasListPageComponent` y `VentaFormPageComponent` existen.
    *   Falta: Confirmar integración de filtros por fecha/cliente y formulario dinámico de detalles.

3.  **Módulo de Usuarios:** ⏳
    *   Servicio `UserService` creado.
    *   Componentes `UsersListPageComponent` y `UserFormPageComponent` existen.
    *   Falta: Confirmar integración de roles y almacenes en formularios/listados.

4.  **Módulos Adicionales (Inventario, Pagos, Pedidos, Gastos):** ⏳
    *   Estructura, servicios y componentes existen.
    *   Falta: Validar funcionalidad completa y conexión con la tabla reutilizable.

> **Recomendación:**
> - Validar que todos los formularios sean reactivos y usen los tipos de `contract.types.ts`.
> - Asegurar que todos los listados usen el `DataTableComponent` para mantener la coherencia visual y funcional.
> - Implementar navegación y feedback de usuario (toasts, loaders) en cada flujo CRUD.

---

## **Fase 7: Testing y Optimización** ⏳

1.  **Implementar Tests Unitarios:** ⏳
    *   Existen archivos `.spec.ts` en varios servicios, pero falta asegurar cobertura completa y tests en componentes clave.
2.  **Implementar Tests End-to-End con Playwright:** ⏳
    *   No se detectan archivos E2E. Pendiente crear y configurar pruebas E2E.
3.  **Optimización de Rendimiento y PWA:** ⏳
    *   Pendiente revisión de performance, lazy loading y configuración PWA.
4.  **Auditoría de Accesibilidad y SEO:** ⏳
    *   Pendiente ejecutar auditorías y aplicar mejoras.

> **Recomendación:**
> - Priorizar la cobertura de tests en servicios y componentes críticos.
> - Configurar Playwright para pruebas E2E.
> - Revisar el uso de `OnPush` en todos los componentes y optimizar el lazy loading.
> - Usar Lighthouse para auditar accesibilidad y SEO.

---

## **Fase 8: Despliegue y Configuración de Producción** ⏳

1.  **Configurar Entornos y CI/CD:** ⏳
    *   Pendiente configurar pipelines de CI/CD y variables de entorno.
2.  **Desplegar en la nube (Netlify, Vercel, etc.):** ⏳
    *   Pendiente seleccionar y configurar plataforma de despliegue.
3.  **Configurar Monitoreo y Analytics:** ⏳
    *   Pendiente integrar herramientas de monitoreo y analítica.

> **Recomendación:**
> - Definir entorno de producción y staging.
> - Automatizar el build y despliegue.
> - Integrar monitoreo (Sentry, Google Analytics, etc.).

---

# Estado actual: 
- Arquitectura y módulos base completos.
- CRUD de productos finalizado y refactorizado.
- Módulos de gestión en progreso, estructura avanzada.
- Falta finalizar integración, testing y despliegue.

> ✅ Fases 1-5 completadas.
> ⏳ Fase 6 en progreso (CRUDs avanzados, integración y validación).
> ⏳ Fases 7-8 pendientes (testing, optimización, despliegue).
