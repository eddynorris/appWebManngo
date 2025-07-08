# Plan de Desarrollo: App Manngo Web

Este plan describe los pasos secuenciales para construir la aplicación, desde la configuración inicial hasta el despliegue, siguiendo las mejores prácticas de Angular.

---

## **Fase 1: Configuración del Esqueleto del Proyecto** ✅

> ✅ Fase completada: Estructura de carpetas y archivos base creada. Rutas principales con lazy loading. Módulos `landing` y `admin` generados.

---

## **Fase 2: Desarrollo de la Landing Page (Pública)** ✅

> ✅ Fase completada: Landing page funcional, responsive y con todas las secciones planificadas.

---

## **Fase 3: Autenticación y Guards** ✅

> ✅ Fase completada: Sistema de autenticación robusto con servicio, guardián de rutas, interceptor HTTP y página de login. Rutas de admin protegidas.

---

## **Fase 4: Módulo Admin y Gestión de Productos** ✅

> ✅ Fase completada: Layout principal del panel administrativo y módulo de productos con CRUD completo y formulario dinámico para presentaciones.

1.  **Dashboard Principal:** ✅
    *   AdminLayoutComponent con navegación lateral y header.
    *   DashboardPageComponent con métricas y resumen del sistema.

2.  **Módulo de Productos:** ✅
    *   Servicio `ProductService` con métodos CRUD.
    *   `ProductsListPageComponent` con búsqueda.
    *   `ProductFormPageComponent` con formulario reactivo para productos y presentaciones.
    *   Tipos TypeScript unificados en `contract.types.ts`.
    *   Rutas configuradas con lazy loading.

---

## **Fase 5: Refactorización y Componentes Reutilizables** ✅

> ✅ Fase completada: Tipos de datos unificados y componente de tabla reutilizable (`DataTableComponent`) implementado en todos los módulos de gestión.

1.  **Unificación de Tipos:** ✅
    *   `contract.types.ts` como fuente única de tipos.
    *   Refactorización de productos y otros módulos para usar los tipos correctos.

2.  **Tabla Reutilizable:** ✅
    *   Componente `DataTableComponent` en `shared/components`.
    *   Configurable por inputs y emite eventos de acción.
    *   Maneja estados de carga y vacío.

3.  **Refactorización de Productos:** ✅
    *   `ProductsListPageComponent` usa el nuevo `DataTableComponent`, simplificando plantilla y lógica.

---

## **Fase 6: Módulos de Gestión (CRUDs avanzados)** ⏳

> ⏳ Fase en revisión: CRUDs de Clientes y Ventas funcionales. El módulo de Usuarios requiere correcciones: error al crear usuario por intentar iterar sobre un objeto no iterable en el formulario, y al editar no se obtiene correctamente la data de almacén y rol del usuario desde el auth. Integración de roles y almacenes en usuarios pendiente de revisión. Todos los listados usan el `DataTableComponent`.

1.  **Clientes:** ✅
    *   Servicio y componentes funcionales.
    *   Integración total con `DataTableComponent` y navegación completa.

2.  **Ventas:** ✅
    *   Servicio y componentes funcionales.
    *   Filtros por fecha/cliente implementados.
    *   Formulario de ventas refactorizado: obtiene datos de un endpoint único, muestra stock disponible y adapta campos según el rol.

3.  **Usuarios:** ⏳
    *   Servicio y componentes funcionales.
    *   **Pendiente:**
        - Corregir error al crear usuario (TypeError: newCollection[Symbol.iterator] is not a function).
        - Al editar, obtener correctamente la data de almacén y rol del usuario desde el auth.
        - Validar integración de roles y almacenes en formularios y listados.
    *   Corrección de rutas y navegación aplicada.

4.  **Módulos adicionales (Inventario, Pagos, Pedidos, Gastos):** ⏳
    *   Estructura, servicios y componentes existen.
    *   Falta: Validar funcionalidad completa y conexión con la tabla reutilizable.

> **Recomendación para cierre de Fase 6:**
> - Corregir errores en el módulo de Usuarios antes de dar la fase por finalizada.
> - Validar exhaustivamente todos los flujos CRUD.
> - Asegurar feedback visual (toasts, loaders) y formularios reactivos.
> - Documentar endpoints y flujos principales.

---

## **Fase 7: Testing y Optimización** ⏳

1.  **Tests Unitarios:** ⏳
    *   Existen archivos `.spec.ts` en servicios y algunos componentes.
    *   Falta asegurar cobertura completa y tests en componentes clave.
2.  **Tests End-to-End (Playwright):** ⏳
    *   Pendiente crear y configurar pruebas E2E.
3.  **Optimización de rendimiento y PWA:** ⏳
    *   Pendiente revisión de performance, lazy loading y configuración PWA.
4.  **Auditoría de Accesibilidad y SEO:** ⏳
    *   Pendiente ejecutar auditorías y aplicar mejoras.

> **Recomendación para Fase 7:**
> - Priorizar tests en servicios y componentes críticos.
> - Configurar Playwright para E2E.
> - Revisar uso de `OnPush` y lazy loading.
> - Usar Lighthouse para auditar accesibilidad y SEO.

---

## **Fase 8: Despliegue y Producción** ⏳

1.  **Configurar Entornos y CI/CD:** ⏳
    *   Pendiente configurar pipelines y variables de entorno.
2.  **Despliegue en la nube:** ⏳
    *   Pendiente seleccionar y configurar plataforma de despliegue.
3.  **Monitoreo y Analytics:** ⏳
    *   Pendiente integrar herramientas de monitoreo y analítica.

> **Recomendación para Fase 8:**
> - Definir entornos de producción y staging.
> - Automatizar build y despliegue.
> - Integrar monitoreo (Sentry, Google Analytics, etc.).

---

# Estado actual:
- Arquitectura y módulos base completos.
- CRUDs de productos, clientes y ventas finalizados y validados.
- Módulo de Usuarios en revisión por errores en formulario y edición.
- Integración de roles, almacenes y feedback visual en formularios y listados en progreso.
- Módulos adicionales en revisión final.
- Falta finalizar testing, optimización y despliegue.

> ✅ Fases 1-5 completadas.
> ⏳ Fase 6 en revisión (pendiente correcciones en Usuarios).
> ⏳ Fase 7 en progreso (testing, optimización).
> ⏳ Fase 8 pendiente (despliegue y monitoreo).
