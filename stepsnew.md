# Guía de Implementación Frontend para el Módulo de Producción

Este documento detalla los pasos y las llamadas a la API necesarias para construir las dos interfaces de usuario principales para la nueva funcionalidad de producción: la pantalla de configuración de recetas para administradores y la pantalla de registro de producción para operadores.

---

## Flujo 1: Administrador - Configuración de Recetas

Esta interfaz permitirá a los usuarios administradores crear, ver, actualizar y eliminar las recetas de cada producto final.

### **Paso 1: Cargar Datos Iniciales de la Página**

Al cargar la página de "Gestión de Recetas", necesitas hacer dos llamadas a la API para obtener los datos necesarios para los formularios:

1.  **Obtener todas las presentaciones de productos**: Para poblar los menús desplegables que permitirán seleccionar tanto el producto final como los componentes de la receta.
    *   **Endpoint**: `GET /presentaciones`

2.  **Obtener todas las recetas existentes**: Para mostrar una lista de las recetas que ya han sido creadas, con botones para editar o eliminar.
    *   **Endpoint**: `GET /recetas`

### **Paso 2: Crear una Nueva Receta**

Cuando el administrador quiera crear una nueva receta, deberá llenar un formulario con la siguiente estructura:

*   **Producto Final**: Un menú desplegable (poblado con los datos del Paso 1) para seleccionar la `presentacion_id` del producto que se va a fabricar (ej: "Saco de 20kg").
*   **Nombre de la Receta**: Un campo de texto (ej: "Fórmula Estándar con Briquetas").
*   **Descripción**: Un campo de texto opcional.
*   **Componentes**: Una lista dinámica donde el admin puede añadir múltiples filas. Cada fila representa un componente y debe tener:
    *   Un desplegable para seleccionar la `componente_presentacion_id` (ej: "Carbón a Granel", "Unidad Saco Vacío").
    *   Un campo numérico para la `cantidad_necesaria` (ej: `18` para kg de carbón, `1` para la unidad de saco).
    *   Un desplegable para seleccionar el `tipo_consumo` (`materia_prima` o `insumo`).

Al guardar, el frontend debe construir y enviar el siguiente JSON:

*   **Endpoint**: `POST /recetas`
*   **Cuerpo (Ejemplo)**:
    ```json
    {
        "presentacion_id": 5, // ID del "Saco de 20kg"
        "nombre": "Fórmula Estándar con Briquetas",
        "descripcion": "Mezcla de 90% carbón y 10% briquetas.",
        "componentes": [
            {
                "componente_presentacion_id": 10, // ID de "Carbón a Granel"
                "cantidad_necesaria": 18,
                "tipo_consumo": "materia_prima"
            },
            {
                "componente_presentacion_id": 11, // ID de "Briquetas a Granel"
                "cantidad_necesaria": 2,
                "tipo_consumo": "materia_prima"
            },
            {
                "componente_presentacion_id": 50, // ID de "Unidad Saco Vacío"
                "cantidad_necesaria": 1,
                "tipo_consumo": "insumo"
            }
        ]
    }
    ```

### **Paso 3: Editar y Eliminar Recetas**

*   **Para Editar**: Al hacer clic en "Editar" en una receta, primero obtén sus datos con `GET /recetas/<id>` y puebla el formulario. Al guardar, envía el mismo formato de JSON que en la creación a `PUT /recetas/<id>`.
*   **Para Eliminar**: Al hacer clic en "Eliminar", envía una petición a `DELETE /recetas/<id>`.

---

## Flujo 2: Operador - Registro Diario de Producción

Esta interfaz debe ser extremadamente simple. El operador solo necesita decir qué producto fabricó, en qué cantidad y de qué lotes sacó la materia prima.

### **Paso 1: Selección Inicial del Operador**

La pantalla debe tener solo dos campos iniciales:

1.  **Producto Fabricado**: Un menú desplegable con los productos finales (ej: "Saco de 20kg", "Briquetas a Granel").
2.  **Cantidad Producida**: Un campo numérico (ej: `50`).

### **Paso 2: El Frontend Obtiene la Receta**

En cuanto el operador selecciona un producto (ej: "Saco de 20kg" con `id=5`), el frontend **automáticamente** hace una llamada para obtener su receta:

*   **Endpoint**: `GET /recetas?presentacion_id=5`

### **Paso 3: El Frontend Pide la Selección de Lotes**

1.  Al recibir la receta, el frontend la recorre y calcula las cantidades totales necesarias (ej: 50 unidades * 18 kg/unidad = 900 kg de carbón).
2.  Identifica los componentes que son `materia_prima`.
3.  Para **cada uno** de esos componentes, muestra al operador un nuevo menú desplegable:
    *   **Llama a la API** para obtener los lotes disponibles de ese material en el almacén del operador: `GET /inventario?presentacion_id=<id_del_carbon>&almacen_id=<id_del_almacen>`.
    *   **Puebla el desplegable** con los lotes encontrados, mostrando información útil como el código del lote y la cantidad disponible.
    *   El operador **debe seleccionar un lote** para cada materia prima requerida.

### **Paso 4: Construir y Enviar la Solicitud Final**

Una vez que el operador ha seleccionado los lotes, el frontend tiene toda la información para construir el JSON simple que se enviará al endpoint inteligente.

*   **Endpoint**: `POST /produccion/fabricacion`
*   **Cuerpo (Ejemplo)**:
    ```json
    {
        "almacen_id": 1, // El almacén del operador
        "presentacion_id": 5, // El ID del producto que se fabricó
        "cantidad_unidades": 50, // La cantidad que se fabricó
        "seleccion_lotes": [ // La información de los lotes que el operador seleccionó
            {
                "presentacion_id": 10, // ID de "Carbón a Granel"
                "lote_id": 101 
            },
            {
                "presentacion_id": 11, // ID de "Briquetas a Granel"
                "lote_id": 102 
            }
        ]
    }
    ```

### **Paso 5: Manejar la Respuesta**

*   Si la API devuelve un código `201 Created`, muestra un mensaje de éxito.
*   Si la API devuelve un error (ej: `400` con un mensaje de "Stock insuficiente"), muestra el mensaje de error específico al operador para que pueda tomar acciones correctivas.
