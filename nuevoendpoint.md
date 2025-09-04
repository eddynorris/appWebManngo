Estructura General del JSON

  El cuerpo de tu solicitud POST debe ser un objeto JSON con las siguientes claves principales:

   * almacen_id (número, requerido): El ID del almacén donde se realiza la producción (ej: la planta).
   * fecha (texto, opcional): La fecha de la producción en formato "YYYY-MM-DD". Si no se envía, se usará la fecha actual.
   * descripcion (texto, requerido): Una descripción clara de la operación. Ej: "Producción de 20 sacos de carbón de 20kg".
   * entradas (lista, requerida): Una lista de los productos finales que se están creando.
   * salidas (lista, requerida): Una lista de todos los componentes (materias primas e insumos) que se están consumiendo.

  ---

  Detalle del Array entradas

  Cada objeto dentro de esta lista representa un producto que estás fabricando.

   1 {
   2     "presentacion_id": 5,
   3     "cantidad_unidades": 20
   4 }
   * presentacion_id: El ID de la presentación del producto final (ej: "Saco de 20kg").
   * cantidad_unidades: El número de unidades que estás produciendo (ej: 20 sacos).

  ---

  Detalle del Array salidas (La Parte Clave)

  Aquí es donde especificas todo lo que se consume. Cada objeto debe tener un tipo_consumo que le dice al sistema cómo procesarlo.

  Caso 1: Consumo de Materia Prima (Carbón, Briquetas, etc.)
  Se usa cuando consumes algo que gestionas por lotes.

   1 {
   2     "tipo_consumo": "materia_prima",
   3     "lote_id": 101,
   4     "cantidad_kg": 360
   5 }
   * tipo_consumo: Siempre "materia_prima".
   * lote_id: El ID del lote específico del que estás sacando el material.
   * cantidad_kg: La cantidad total en kilogramos que consumes de ese lote para esta producción.

  Caso 2: Consumo de Insumos (Sacos, Hilo, etc.)
  Se usa para los materiales que no se gestionan por lotes.

   1 {
   2     "tipo_consumo": "insumo",
   3     "presentacion_id": 50,
   4     "cantidad_unidades": 20
   5 }
   * tipo_consumo: Siempre "insumo".
   * presentacion_id: El ID de la presentación del insumo (ej: "Unidad Saco Vacío").
   * cantidad_unidades: El número de unidades que consumes (ej: 20 sacos).

  ---

  Ejemplo Completo y Práctico

  Imaginemos que vamos a producir 20 sacos de 20kg. Cada saco usa 18kg de carbón y 2kg de briquetas. Además, se necesita 1 saco vacío y 1 unidad de hilo por cada saco producido.

  El JSON que enviarías a POST /produccion/ensamblaje se vería así:

    1 {
    2     "almacen_id": 1,
    3     "fecha": "2025-08-29",
    4     "descripcion": "Producción de 20 sacos de carbón de 20kg con briquetas",
    5     "entradas": [
    6         {
    7             "presentacion_id": 5,   // ID de la presentación "Saco de 20kg"
    8             "cantidad_unidades": 20
    9         }
   10     ],
   11     "salidas": [
   12         // --- Materias Primas ---
   13         {
   14             "tipo_consumo": "materia_prima",
   15             "lote_id": 101, // Lote específico de Carbón a Granel
   16             "cantidad_kg": 360 // 20 sacos * 18 kg/saco
   17         },
   18         {
   19             "tipo_consumo": "materia_prima",
   20             "lote_id": 102, // Lote específico de Briquetas a Granel
   21             "cantidad_kg": 40  // 20 sacos * 2 kg/saco
   22         },
   23         // --- Insumos ---
   24         {
   25             "tipo_consumo": "insumo",
   26             "presentacion_id": 50, // ID de la presentación "Unidad Saco Vacío"
   27             "cantidad_unidades": 20 // 1 por cada saco
   28         },
   29         {
   30             "tipo_consumo": "insumo",
   31             "presentacion_id": 51, // ID de la presentación "Unidad Hilo para coser"
   32             "cantidad_unidades": 20 // 1 por cada saco
   33         }
   34     ]
   35 }

  Ejemplo de Flexibilidad (Producción sin Briquetas)

  Si un día no tienes briquetas y produces los 20 sacos usando solo carbón (20kg por saco), simplemente omites esa salida en el JSON. El sistema es totalmente flexible.

    1 {
    2     "almacen_id": 1,
    3     "descripcion": "Producción de 20 sacos de 20kg (solo carbón)",
    4     "entradas": [
    5         { "presentacion_id": 5, "cantidad_unidades": 20 }
    6     ],
    7     "salidas": [
    8         {
    9             "tipo_consumo": "materia_prima",
   10             "lote_id": 101,
   11             "cantidad_kg": 400 // 20 sacos * 20 kg/saco
   12         },
   13         {
   14             "tipo_consumo": "insumo",
   15             "presentacion_id": 50,
   16             "cantidad_unidades": 20
   17         },
   18         {
   19             "tipo_consumo": "insumo",
   20             "presentacion_id": 51,
   21             "cantidad_unidades": 20
   22         }
   23     ]
   24 }