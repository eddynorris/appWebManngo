# Plan de Desarrollo: App Manngo Web

Este plan describe los pasos secuenciales para construir la aplicación, desde la configuración inicial hasta el despliegue, siguiendo las mejores prácticas de Angular y un enfoque modular, reutilizable y optimizado.

---

## **Fase 1: Configuración del Esqueleto del Proyecto** ✅

> ✅ Fase completada: Estructura de carpetas y archivos base creada. Rutas principales con lazy loading. Módulos `landing` y `admin` generados.

---

## **Fase 2: Desarrollo de la Landing Page (Pública)** ⏳

> ⏳ Fase en revisión: Landing page funcional y responsive, pero pendiente de mejoras visuales y de contenido para producción (optimización de imágenes, SEO, animaciones y copy final).

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

## **Fase 5: Refactorización, Componentes y Estilos Reutilizables** ✅

> ✅ Fase completada: Refactorización profunda para máxima reutilización y optimización de estilos.

1.  **Unificación de Tipos:** ✅
    *   `contract.types.ts` como fuente única de tipos.
    *   Refactorización de productos y otros módulos para usar los tipos correctos.

2.  **Tabla Reutilizable y Estilos Globales:** ✅
    *   Componente `DataTableComponent` en `shared/components` para listados CRUD.
    *   Clases globales de tabla (`.table-container`, etc.) en `_components.scss`.
    *   Todas las tablas de la app usan los estilos globales para máxima coherencia visual y mantenibilidad.

3.  **Modales Reutilizables:** ✅
    *   Componente `ModalComponent` en `shared/components/modal` con API flexible, slots, accesibilidad y animaciones.
    *   Todos los modales de la app (detalle de deuda, detalle de venta, etc.) usan el modal global.
    *   Eliminación de duplicidad de SCSS y lógica de modales.

4.  **Optimización de SCSS:** ✅
    *   Refactorización de todos los archivos SCSS para usar mixins, utilidades y clases globales.
    *   Reducción drástica del tamaño de los archivos SCSS y cumplimiento del budget (<4kB por archivo).
    *   Uso de variables y utilidades globales para colores, tipografía, espaciados y responsive.

---

## **Fase 6: Módulos de Gestión (CRUDs avanzados)** ✅

> ✅ Fase completada: Todos los módulos CRUD (Productos, Clientes, Ventas, Usuarios, Inventario, Pagos, Pedidos, Gastos) funcionales, integrados con la tabla y modales reutilizables, y validados visualmente.

1.  **Clientes:** ✅
    *   Servicio y componentes funcionales.
    *   Integración total con `DataTableComponent` y navegación completa.

2.  **Ventas:** ✅
    *   Servicio y componentes funcionales.
    *   Filtros por fecha/cliente implementados.
    *   Formulario de ventas refactorizado: obtiene datos de un endpoint único, muestra stock disponible y adapta campos según el rol.

3.  **Usuarios:** ✅
    *   Servicio y componentes funcionales.
    *   Integración de roles y almacenes en formularios y listados.
    *   Corrección de rutas y navegación aplicada.

4.  **Módulos adicionales (Inventario, Pagos, Pedidos, Gastos):** ✅
    *   Estructura, servicios y componentes funcionales.
    *   Todos los listados y formularios usan componentes y estilos globales.

> **Checklist de cierre de Fase 6:**
> - [x] Todos los CRUDs funcionales y validados visualmente.
> - [x] Feedback visual (toasts, loaders) y formularios reactivos en todos los módulos.
> - [x] Documentación de endpoints y flujos principales.

---

## **Fase 7: Testing, Accesibilidad y Optimización** ⏳

1.  **Tests Unitarios:** ⏳
    *   Archivos `.spec.ts` en servicios y componentes clave.
    *   Falta asegurar cobertura completa y tests en componentes críticos.
2.  **Tests End-to-End (Playwright):** ⏳
    *   Pendiente crear y configurar pruebas E2E.
3.  **Optimización de rendimiento y PWA:** ⏳
    *   Revisión de performance, lazy loading y configuración PWA en progreso.
4.  **Auditoría de Accesibilidad y SEO:** ⏳
    *   Ejecución de auditorías y aplicación de mejoras en curso.

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

## **Fase 9: Reportes y Analíticas** ⏳

> ⏳ Fase en progreso: Implementación de reportes avanzados para la gestión del inventario y la producción.

1.  **Extender `MovimientoService`:** ⏳
    *   Añadir un método `getMovimientosFiltrados(filtros: any): Observable<PaginatedResponse<Movimiento>>` que acepte parámetros de consulta (`tipo`, `lote_id`, `fecha_inicio`, `fecha_fin`).

    *Ejemplo de llamada y respuesta esperada para `GET /movimientos?tipo=entrada&lote_id=1`:*

    ```http
    GET /movimientos?tipo=entrada&lote_id=1
    ```

    ```json
    {
      "data": [
        {
          "id": 1,
          "tipo": "entrada",
          "cantidad": "10.00",
          "fecha": "2023-01-10T00:00:00+00:00",
          "motivo": "Carga inicial",
          "presentacion": {
            "id": 1,
            "nombre": "Saco 20kg",
            "capacidad_kg": "20.00"
          },
          "lote": {
            "id": 1,
            "cantidad_disponible_kg": "1000.00",
            "descripcion": "Lote A"
          },
          "usuario": {
            "id": 1,
            "username": "admin_mov"
          },
          "total_kg": "200.00"
        },
        {
          "id": 3,
          "tipo": "entrada",
          "cantidad": "20.00",
          "fecha": "2023-01-18T00:00:00+00:00",
          "motivo": "Recepción",
          "presentacion": {
            "id": 2,
            "nombre": "Bolsa 5kg",
            "capacidad_kg": "5.00"
          },
          "lote": {
            "id": 1,
            "cantidad_disponible_kg": "1000.00",
            "descripcion": "Lote A"
          },
          "usuario": {
            "id": 1,
            "username": "admin_mov"
          },
          "total_kg": "100.00"
        }
      ],
      "pagination": {
        "total": 2,
        "page": 1,
        "per_page": 10,
        "pages": 1
      }
    }
    ```

2.  **Crear Componente de Reporte de Inventario por Lote:** ⏳
    *   Generar un nuevo componente `ReporteInventarioPorLotePageComponent` en `src/app/features/admin/inventarios/pages/`.
    *   Utilizar `inject()` para obtener `MovimientoService` y `NotificationService`.
    *   Definir señales para los datos del reporte, filtros (lote_id, rango de fechas), y estado de carga.
    *   Implementar la lógica para llamar al `MovimientoService` con los filtros.
    *   Procesar la respuesta: agrupar los `Movimiento` por `lote` y `presentacion`, y sumar las `cantidad` para cada combinación, calculando también el `total_kg` (cantidad * presentacion.capacidad_kg).
    *   Manejar la paginación de forma que se refleje el resultado agrupado, si es necesario, o considerarla en la llamada al backend.
    *   Mostrar los resultados en una tabla utilizando el `DataTableComponent` compartido, con columnas para Lote, Producto, Presentación, Cantidad Total Producida y Kilogramos Totales.
    *   Diseñar el formulario de filtros (lote, rango de fechas) utilizando Reactive Forms.

3.  **Configurar Rutas para el Reporte:** ⏳
    *   Añadir una nueva ruta en `src/app/features/admin/inventarios/inventarios.routes.ts` que apunte al `ReporteInventarioPorLotePageComponent`.

4.  **Diseño y Estilos del Reporte:** ⏳
    *   Aplicar `stylesrules` para el layout general y los elementos de la tabla.
    *   Utilizar las clases globales de `_components.scss` para los elementos de UI (botones, formularios, tabla).

> **Checklist de cierre de Fase 9 (Parcial):**
> - [ ] Método `getMovimientosFiltrados` en `MovimientoService` implementado y probado.
> - [ ] `ReporteInventarioPorLotePageComponent` creado, con lógica de filtrado, agrupación y cálculo.
> - [ ] Formulario de filtros funcional.
> - [ ] Datos del reporte visualizados correctamente en `DataTableComponent`.
> - [ ] Nueva ruta configurada y accesible desde la navegación de Admin.

---

## **Fase 10: Pruebas y Aseguramiento de Calidad** ⏳

> ⏳ Fase pendiente: Profundizar en pruebas unitarias y E2E para garantizar la estabilidad y correcto funcionamiento de la aplicación.

1.  **Tests Unitarios:** ⏳
    *   Escribir pruebas unitarias exhaustivas para el nuevo método en `MovimientoService`.
    *   Escribir pruebas unitarias para la lógica del `ReporteInventarioPorLotePageComponent`, asegurando que el filtrado, agrupación y cálculo sean correctos.

2.  **Tests End-to-End (Playwright):** ⏳
    *   Crear escenarios de prueba E2E con Playwright para el flujo completo del reporte, desde la navegación, aplicación de filtros, hasta la visualización de los resultados esperados.

> **Recomendación para Fase 10:**
> - Aumentar la cobertura de tests unitarios en las nuevas funcionalidades.
> - Desarrollar tests E2E robustos para los flujos críticos del reporte.

---

# Estado actual:
- Arquitectura y módulos base completos.
- CRUDs de productos, clientes, ventas, usuarios y módulos adicionales finalizados y validados.
- **Todos los listados y modales usan componentes y estilos globales reutilizables.**
- Refactorización de SCSS y optimización de estilos completada.
- Solo faltan mejoras visuales y de contenido en la landing page para producción.
- Testing, optimización y despliegue en curso.

> ✅ Fases 1-6 completadas.
> ⏳ Fase 7 en progreso (testing, optimización, accesibilidad).
> ⏳ Fase 8 pendiente (despliegue y monitoreo).

---

## Checklist de Pre-Producción y Lanzamiento 🚦

Antes de desplegar la aplicación a producción, asegúrate de cumplir con los siguientes puntos:

- [ ] **Eliminar todos los `console.log`, `console.error`, `debugger` y trazas de depuración** en el código fuente (componentes, servicios, etc.).
- [ ] **Revisar y actualizar el `.gitignore`** para evitar subir archivos sensibles, carpetas de build, credenciales, archivos de entorno locales, etc.
- [ ] **Configurar correctamente los archivos de entorno (`environment.prod.ts`)** con las URLs y claves de producción.
- [ ] **Verificar que no existan datos de prueba o mocks** en la base de datos ni en el frontend.
- [ ] **Revisar y limpiar dependencias** en `package.json` y eliminar paquetes no utilizados.
- [ ] **Ejecutar auditoría de seguridad** (`npm audit`) y actualizar dependencias vulnerables.
- [ ] **Optimizar imágenes y recursos estáticos** en la carpeta `assets/`.
- [ ] **Revisar y probar la PWA (si aplica):** manifest, iconos, offline, etc.
- [ ] **Ejecutar auditoría de accesibilidad y SEO** (Lighthouse, etc.).
- [ ] **Verificar que todos los formularios tengan validaciones y feedback visual.**
- [ ] **Asegurar que todos los endpoints y rutas estén protegidos por guards y roles.**
- [ ] **Revisar el build de producción (`ng build --configuration=production`)** y probar la app minificada.
- [ ] **Configurar y probar el sistema de logs y monitoreo** (Sentry, Analytics, etc.).
- [ ] **Revisar la configuración de CORS y seguridad en el backend.**
- [ ] **Actualizar la documentación técnica y de usuario final.**
- [ ] **Realizar un backup de la base de datos y del entorno actual antes del despliegue.**
- [ ] **Verificar que el pipeline de CI/CD esté funcionando y automatizado.**
- [ ] **Hacer un despliegue en staging y validar con usuarios clave antes de ir a producción.**

> **Consejo:** Haz una última revisión visual y funcional de toda la app en modo incógnito y en dispositivos móviles para detectar detalles finales.

---
