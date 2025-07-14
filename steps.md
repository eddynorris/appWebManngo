# Plan de Desarrollo: App Manngo Web

Este plan describe los pasos secuenciales para construir la aplicación, desde la configuración inicial hasta el despliegue, siguiendo las mejores prácticas de Angular y un enfoque modular, reutilizable y optimizado.

---

## **Fase 1: Configuración del Esqueleto del Proyecto** ✅

> ✅ Fase completada: Estructura de carpetas y archivos base creada. Rutas principales con lazy loading. Módulos `landing` y `admin` generados.

---

## **Fase 2: Desarrollo de la Landing Page (Pública)** ⏳

> ⏳ Fase en finalización: Landing page funcional y responsive, pero requiere completar elementos clave para producción (modales legales, navegación suave, centrado de productos).

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

## **Fase 9: Reportes y Analíticas** ✅

> ✅ Fase completada: Sistema de reportes implementado con filtros avanzados y navegación mejorada.

1.  **MovimientoService y LoteService:** ✅
    *   `MovimientoService` creado con método `getMovimientosFiltrados` que acepta filtros por tipo, lote, fechas y paginación.
    *   `LoteService` implementado para obtener lotes disponibles.
    *   Integración completa con tipos TypeScript y respuestas paginadas.

2.  **Reporte de Inventario por Lote:** ✅
    *   `ReporteInventarioPorLotePageComponent` creado en `src/app/features/admin/reportes/pages/`.
    *   Select dropdown para lotes con descripción en lugar de ID numérico.
    *   Lógica de agrupación por lote y presentación con cálculos automáticos.
    *   Filtros responsivos con sistema de grid flexible (col-1, col-2, etc.).
    *   Integración completa con `DataTableComponent` reutilizable.

3.  **Navegación y UX:** ✅
    *   Sidebar rediseñado con gradientes modernos y animaciones suaves.
    *   Sistema de dropdown para "Reportes" con indicadores visuales.
    *   Rutas configuradas con lazy loading en `reportes.routes.ts`.
    *   Dashboard refactorizado para usar `DataTableComponent` consistente.

4.  **Optimización y Estilos:** ✅
    *   Sistema de filtros con grid responsivo similar a Bootstrap.
    *   Estilos globales optimizados respetando budget de SCSS (<4kB).
    *   Animaciones profesionales y transiciones con cubic-bezier.
    *   Solución de problemas de ventas (datetime-local y consumo_diario_kg).

> **Checklist de cierre de Fase 9:**
> - [x] `MovimientoService` y `LoteService` implementados y funcionando.
> - [x] `ReporteInventarioPorLotePageComponent` completado con filtros inteligentes.
> - [x] Sistema de navegación dropdown funcional con animaciones.
> - [x] Dashboard migrado a `DataTableComponent` manteniendo funcionalidad.
> - [x] Optimización de SCSS y cumplimiento de budget de archivos.
> - [x] Corrección de errores en formulario de ventas.

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

## **Fase 11: Finalización de Landing Page para Producción** ⏳

> ⏳ Fase iniciada: Completando elementos clave de la landing page para estar lista para producción.

### **Plan de Finalización de Landing Page:**

#### **Análisis del Estado Actual:**
✅ **Componentes Funcionales Existentes:**
- Header con navegación desktop y móvil
- Hero section con call-to-actions
- Products Preview (7 productos)
- Testimonials con grid de testimonios
- CTA Banner con formulario de newsletter
- Footer con enlaces legales
- Benefits y Recipes Preview correctamente comentados

#### **Tareas Críticas para Producción:**

1. **Modales Legales:** ✅
   - [x] Crear `PrivacyPolicyModalComponent` para política de privacidad
   - [x] Crear `TermsConditionsModalComponent` para términos y condiciones
   - [x] Crear `OurStoryModalComponent` para historia de la empresa
   - [x] Crear `FaqModalComponent` para preguntas frecuentes
   - [x] Integrar modales en Footer y navegación

2. **Navegación Suave (Smooth Scroll):** ✅
   - [x] Implementar servicio de scroll suave para navegación interna
   - [x] Corregir desajuste de IDs entre header y secciones:
     - `#products-preview` → `#productos`
     - `#benefits` → `#beneficios`
   - [x] Añadir animaciones profesionales con cubic-bezier
   - [x] Implementar scroll spy para destacar sección activa

3. **Corrección de Layout de Productos:** ✅
   - [x] Arreglar centrado de products-preview (7 productos con 7mo desalineado)
   - [x] Implementar grid responsivo que centre correctamente elementos impares
   - [x] Revisar estilos globales para layout de productos
   - [x] Asegurar que el layout funcione en todas las resoluciones

4. **Optimización y Detalles Finales:** ⏳
   - [x] Validar que todas las imágenes tengan optimización adecuada
   - [x] Revisar responsive design en dispositivos móviles
   - [x] Verificar accesibilidad de la navegación y modales
   - [ ] Revisar warnings de budget SCSS y optimizar archivos grandes
   - [ ] Limpiar componentes no utilizados (LandingBenefitsComponent, LandingRecipesPreviewComponent)
   - [ ] Eliminar archivos TypeScript no utilizados identificados en build

#### **Estructura de Archivos a Crear:**
```
src/app/features/landing/
├── components/
│   ├── modals/
│   │   ├── privacy-policy-modal/
│   │   ├── terms-conditions-modal/
│   │   ├── our-story-modal/
│   │   └── faq-modal/
│   └── ...
├── services/
│   └── smooth-scroll.service.ts
└── ...
```

#### **Criterios de Aceptación:**
- [x] Landing page completamente navegable con scroll suave
- [x] Todos los enlaces legales abren modales funcionales con contenido
- [x] Layout de productos centrado correctamente en todas las resoluciones
- [x] Navegación móvil y desktop funcionando perfecto
- [x] Performance y accesibilidad optimizadas para producción

> **✅ Meta Completada:** Landing page lista para producción con experiencia de usuario profesional y todos los elementos legales requeridos.

#### **Resumen de Implementación Completada:**

**🎯 Componentes Modales Creados:**
- `PrivacyPolicyModalComponent` - Política de privacidad completa
- `TermsConditionsModalComponent` - Términos y condiciones detallados  
- `OurStoryModalComponent` - Historia de la empresa con valores y misión
- `FaqModalComponent` - 8 preguntas frecuentes con sistema expandible

**🎯 Sistema de Navegación Implementado:**
- `SmoothScrollService` - Servicio para scroll suave con scroll spy
- Header actualizado con navegación por clicks y estados activos
- IDs corregidos: hero, productos, beneficios, recetas, testimonios, contacto

**🎯 Layout de Productos Optimizado:**
- Grid responsive con 3 columnas que centra el 7mo producto
- Breakpoints para tablet (2 columnas) y móvil (1 columna)
- Elementos centrados correctamente en todas las resoluciones

**🎯 Integración Completa:**
- Footer con enlaces funcionales a modales
- Todos los modales con contenido real y diseño profesional
- Sistema de señales Angular para estado de modales
- Animaciones y transiciones profesionales implementadas

---

# Estado actual:
- Arquitectura y módulos base completos.
- CRUDs de productos, clientes, ventas, usuarios y módulos adicionales finalizados y validados.
- **Sistema de reportes con filtros avanzados completamente funcional.**
- **Todos los listados y modales usan componentes y estilos globales reutilizables.**
- Refactorización de SCSS y optimización de estilos completada.
- Landing page funcional pero requiere elementos finales para producción.
- Testing, optimización y despliegue en curso.

> ✅ Fases 1-6, 9 y 11 completadas.
> ✅ Fase 2 (Landing) finalizada para producción.
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
