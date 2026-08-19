# Guía de Integración Frontend: Reporte de Producción y Entradas

Documentación técnica y completa para consumir y renderizar en el frontend el endpoint de **Reporte de Movimientos de Entrada (Producción, Lotes y Traslados entre Almacenes)**.

---

## 1. Especificación del Endpoint

- **Método HTTP:** `GET`
- **Ruta Principal:** `/reportes/produccion-entradas`
- **Ruta Alias:** `/reportes/movimientos-entrada`
- **Autenticación:** Header `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Content-Type:** `application/json`

---

## 2. Parámetros de Consulta (Query Params)

Envía estos parámetros en la URL según los filtros seleccionados por el usuario en la interfaz:

| Parámetro | Tipo | Requerido | Valor por Defecto | Descripción | Ejemplo |
|---|---|---|---|---|---|
| `fecha_inicio` | `string` (YYYY-MM-DD) | No | Hace 30 días | Fecha inicial del rango de búsqueda | `2026-08-01` |
| `fecha_fin` | `string` (YYYY-MM-DD) | No | Hoy | Fecha final del rango de búsqueda | `2026-08-19` |
| `almacen_id` | `number` | No | `null` (Todos) | Filtrar por ID de almacén / planta | `1` |
| `lote_id` | `number` | No | `null` (Todos) | Filtrar por ID de un lote específico | `5` |
| `producto_id` | `number` | No | `null` (Todos) | Filtrar por producto base (ej. Carbón Vegetal) | `1` |
| `presentacion_id` | `number` | No | `null` (Todos) | Filtrar por presentación comercial (ej. Saco 20kg) | `3` |
| `tipo_operacion` | `string` | No | `todos` | Tipo de movimiento: `'todos'`, `'produccion'` o `'transferencia'` | `produccion` |

### Ejemplo de URL Completa:
```http
GET https://api.manngo.pe/reportes/produccion-entradas?fecha_inicio=2026-08-01&fecha_fin=2026-08-19&almacen_id=1&tipo_operacion=todos
```

---

## 3. Estructura Completa del JSON de Respuesta

```json
{
  "periodo": {
    "fecha_inicio": "2026-08-01",
    "fecha_fin": "2026-08-19"
  },
  "filtros_aplicados": {
    "almacen_id": 1,
    "lote_id": null,
    "presentacion_id": null,
    "producto_id": null,
    "tipo_operacion": "todos"
  },
  "resumen_general": {
    "total_unidades_ingresadas": 250,
    "total_kg_ingresados": 2140.0,
    "produccion": {
      "total_unidades": 230,
      "total_kg": 1740.0,
      "total_lotes_utilizados": 2,
      "total_operaciones": 3
    },
    "traslados": {
      "total_unidades": 20,
      "total_kg": 400.0,
      "total_operaciones": 1
    }
  },
  "produccion_por_lote": [
    {
      "lote_id": 1,
      "codigo_lote": "LOT-2026-001",
      "descripcion_lote": "Lote Carbón Quebracho Blanco",
      "producto_id": 1,
      "producto_nombre": "Carbón Vegetal",
      "unidades_producidas": 150,
      "kg_producidos": 1500.0,
      "operaciones_count": 2,
      "presentaciones": [
        {
          "presentacion_id": 1,
          "presentacion_nombre": "Saco 20kg Granel",
          "capacidad_kg": 20.0,
          "unidades": 50,
          "kg": 1000.0
        },
        {
          "presentacion_id": 2,
          "presentacion_nombre": "Bolsa 5kg Premium",
          "capacidad_kg": 5.0,
          "unidades": 100,
          "kg": 500.0
        }
      ]
    }
  ],
  "produccion_por_presentacion": [
    {
      "presentacion_id": 1,
      "presentacion_nombre": "Saco 20kg Granel",
      "producto_nombre": "Carbón Vegetal",
      "tipo_presentacion": "procesado",
      "capacidad_kg": 20.0,
      "unidades_producidas": 50,
      "kg_producidos": 1000.0,
      "lotes_involucrados": ["LOT-2026-001"]
    }
  ],
  "traslados_entre_almacenes": [
    {
      "movimiento_id": 4,
      "operacion_id": "ab12cd34",
      "fecha": "2026-08-19T14:30:00+00:00",
      "presentacion_id": 1,
      "presentacion_nombre": "Saco 20kg Granel",
      "producto_nombre": "Carbón Vegetal",
      "lote_id": 1,
      "codigo_lote": "LOT-2026-001",
      "cantidad_unidades": 20.0,
      "capacidad_kg": 20.0,
      "total_kg": 400.0,
      "almacen_origen": "Planta Principal",
      "almacen_destino": "Tienda Central",
      "motivo": "Transferencia desde Planta Principal (Op: ab12cd34)",
      "usuario_nombre": "admin_user"
    }
  ],
  "resumen_temporal": [
    {
      "fecha": "2026-08-14",
      "unidades_produccion": 50,
      "kg_produccion": 1000.0,
      "unidades_traslado": 0,
      "kg_traslado": 0.0,
      "total_unidades_dia": 50,
      "total_kg_dia": 1000.0
    }
  ],
  "movimientos_detalle": [
    {
      "id": 101,
      "fecha": "2026-08-14T10:00:00+00:00",
      "tipo_operacion": "ensamblaje",
      "presentacion_id": 1,
      "presentacion_nombre": "Saco 20kg Granel",
      "producto_id": 1,
      "producto_nombre": "Carbón Vegetal",
      "lote_id": 1,
      "codigo_lote": "LOT-2026-001",
      "cantidad_unidades": 50.0,
      "capacidad_kg": 20.0,
      "total_kg": 1000.0,
      "motivo": "Fabricación por receta de 50 sacos de 20kg",
      "usuario_id": 2,
      "usuario_nombre": "operario_planta",
      "almacen_nombre": "Planta Principal"
    }
  ]
}
```

---

## 4. Tipos e Interfaces de TypeScript

Puedes copiar estas interfaces directamente en tu proyecto frontend (`types/produccionReporte.ts`):

```typescript
export interface IPeriodo {
  fecha_inicio: string;
  fecha_fin: string;
}

export interface IFiltrosAplicados {
  almacen_id: number | null;
  lote_id: number | null;
  presentacion_id: number | null;
  producto_id: number | null;
  tipo_operacion: 'todos' | 'produccion' | 'transferencia';
}

export interface IResumenSubtotal {
  total_unidades: number;
  total_kg: number;
  total_lotes_utilizados?: number;
  total_operaciones: number;
}

export interface IResumenGeneral {
  total_unidades_ingresadas: number;
  total_kg_ingresados: number;
  produccion: IResumenSubtotal;
  traslados: IResumenSubtotal;
}

export interface IPresentacionLoteItem {
  presentacion_id: number | null;
  presentacion_nombre: string;
  capacidad_kg: number | null;
  unidades: number;
  kg: number;
}

export interface IProduccionPorLote {
  lote_id: number | null;
  codigo_lote: string;
  descripcion_lote: string | null;
  producto_id: number | null;
  producto_nombre: string;
  unidades_producidas: number;
  kg_producidos: number;
  operaciones_count: number;
  presentaciones: IPresentacionLoteItem[];
}

export interface IProduccionPorPresentacion {
  presentacion_id: number | null;
  presentacion_nombre: string;
  producto_nombre: string;
  tipo_presentacion: string | null;
  capacidad_kg: number | null;
  unidades_producidas: number;
  kg_producidos: number;
  lotes_involucrados: string[];
}

export interface ITrasladoEntreAlmacenes {
  movimiento_id: number;
  operacion_id: string | null;
  fecha: string | null;
  presentacion_id: number | null;
  presentacion_nombre: string;
  producto_nombre: string;
  lote_id: number | null;
  codigo_lote: string;
  cantidad_unidades: number;
  capacidad_kg: number | null;
  total_kg: number;
  almacen_origen: string;
  almacen_destino: string;
  motivo: string | null;
  usuario_nombre: string | null;
}

export interface IResumenTemporalItem {
  fecha: string;
  unidades_produccion: number;
  kg_produccion: number;
  unidades_traslado: number;
  kg_traslado: number;
  total_unidades_dia: number;
  total_kg_dia: number;
}

export interface IMovimientoDetalle {
  id: number;
  fecha: string | null;
  tipo_operacion: string;
  presentacion_id: number | null;
  presentacion_nombre: string;
  producto_id: number | null;
  producto_nombre: string;
  lote_id: number | null;
  codigo_lote: string;
  cantidad_unidades: number;
  capacidad_kg: number | null;
  total_kg: number;
  motivo: string | null;
  usuario_id: number | null;
  usuario_nombre: string | null;
  almacen_nombre: string;
}

export interface IReporteProduccionEntradasResponse {
  periodo: IPeriodo;
  filtros_aplicados: IFiltrosAplicados;
  resumen_general: IResumenGeneral;
  produccion_por_lote: IProduccionPorLote[];
  produccion_por_presentacion: IProduccionPorPresentacion[];
  traslados_entre_almacenes: ITrasladoEntreAlmacenes[];
  resumen_temporal: IResumenTemporalItem[];
  movimientos_detalle: IMovimientoDetalle[];
}
```

---

## 5. Ejemplos de Implementación en Frontend

### 5.1 Servicio con Axios (React / Vue / Angular)

```typescript
import axios from 'axios';
import { IReporteProduccionEntradasResponse } from '../types/produccionReporte';

export interface IReporteFiltros {
  fecha_inicio?: string;
  fecha_fin?: string;
  almacen_id?: number;
  lote_id?: number;
  producto_id?: number;
  presentacion_id?: number;
  tipo_operacion?: 'todos' | 'produccion' | 'transferencia';
}

export const getReporteProduccionEntradas = async (
  filtros: IReporteFiltros = {}
): Promise<IReporteProduccionEntradasResponse> => {
  const token = localStorage.getItem('token');
  
  const response = await axios.get<IReporteProduccionEntradasResponse>(
    '/reportes/produccion-entradas',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: filtros,
    }
  );

  return response.data;
};
```

---

### 5.2 Hook / Componente en React con TanStack Query (React Query)

```tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReporteProduccionEntradas, IReporteFiltros } from './services/reporteService';

export const ReporteProduccionView: React.FC = () => {
  const [filtros, setFiltros] = useState<IReporteFiltros>({
    fecha_inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fecha_fin: new Date().toISOString().split('T')[0],
    tipo_operacion: 'todos'
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['reporte-produccion-entradas', filtros],
    queryFn: () => getReporteProduccionEntradas(filtros),
    staleTime: 1000 * 60 * 5, // 5 minutos de caché
  });

  if (isLoading) return <div>Cargando reporte de producción...</div>;
  if (error || !data) return <div>Error al cargar el reporte</div>;

  const { resumen_general, produccion_por_lote, traslados_entre_almacenes } = data;

  return (
    <div className="p-6 space-y-6">
      {/* 1. Barra de Filtros */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow">
        <input 
          type="date" 
          value={filtros.fecha_inicio} 
          onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })} 
          className="border p-2 rounded"
        />
        <input 
          type="date" 
          value={filtros.fecha_fin} 
          onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })} 
          className="border p-2 rounded"
        />
        <select 
          value={filtros.tipo_operacion} 
          onChange={(e) => setFiltros({ ...filtros, tipo_operacion: e.target.value as any })}
          className="border p-2 rounded"
        >
          <option value="todos">Todos los Movimientos</option>
          <option value="produccion">Solo Producción</option>
          <option value="transferencia">Solo Traslados</option>
        </select>
      </div>

      {/* 2. Tarjetas de KPIs (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
          <p className="text-sm text-emerald-600 font-medium">Total Producido (KG)</p>
          <h3 className="text-2xl font-bold text-emerald-900">{resumen_general.produccion.total_kg.toLocaleString()} kg</h3>
          <span className="text-xs text-emerald-500">{resumen_general.produccion.total_unidades} unidades</span>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Total Trasladado (KG)</p>
          <h3 className="text-2xl font-bold text-blue-900">{resumen_general.traslados.total_kg.toLocaleString()} kg</h3>
          <span className="text-xs text-blue-500">{resumen_general.traslados.total_unidades} unidades</span>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
          <p className="text-sm text-amber-600 font-medium">Lotes Involucrados</p>
          <h3 className="text-2xl font-bold text-amber-900">{resumen_general.produccion.total_lotes_utilizados} lotes</h3>
          <span className="text-xs text-amber-500">{resumen_general.produccion.total_operaciones} órdenes de ensamble</span>
        </div>

        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
          <p className="text-sm text-purple-600 font-medium">Total Ingresos General</p>
          <h3 className="text-2xl font-bold text-purple-900">{resumen_general.total_kg_ingresados.toLocaleString()} kg</h3>
          <span className="text-xs text-purple-500">{resumen_general.total_unidades_ingresadas} unidades totales</span>
        </div>
      </div>

      {/* 3. Tabla: Producción por Lote */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-4">Producción Desglosada por Lote</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="p-3">Código de Lote</th>
                <th className="p-3">Producto</th>
                <th className="p-3">Unidades</th>
                <th className="p-3">Total (KG)</th>
                <th className="p-3">Presentaciones Fabricadas</th>
              </tr>
            </thead>
            <tbody>
              {produccion_por_lote.map((lote) => (
                <tr key={lote.lote_id || lote.codigo_lote} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-800">{lote.codigo_lote}</td>
                  <td className="p-3">{lote.producto_nombre}</td>
                  <td className="p-3">{lote.unidades_producidas} und</td>
                  <td className="p-3 font-bold text-emerald-700">{lote.kg_producidos.toLocaleString()} kg</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {lote.presentaciones.map((p, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {p.presentacion_nombre}: <b>{p.unidades} und</b> ({p.kg} kg)
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Tabla: Traslados entre Almacenes */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-4">Traslados Recibidos entre Almacenes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="p-3">Fecha</th>
                <th className="p-3">Origen ➔ Destino</th>
                <th className="p-3">Presentación</th>
                <th className="p-3">Lote</th>
                <th className="p-3">Cantidad</th>
                <th className="p-3">Total KG</th>
                <th className="p-3">N° Operación</th>
              </tr>
            </thead>
            <tbody>
              {traslados_entre_almacenes.map((t) => (
                <tr key={t.movimiento_id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm">{t.fecha ? new Date(t.fecha).toLocaleDateString() : '-'}</td>
                  <td className="p-3 font-medium text-blue-700">{t.almacen_origen} ➔ {t.almacen_destino}</td>
                  <td className="p-3">{t.presentacion_nombre}</td>
                  <td className="p-3 font-mono text-xs">{t.codigo_lote}</td>
                  <td className="p-3">{t.cantidad_unidades} und</td>
                  <td className="p-3 font-bold text-blue-900">{t.total_kg} kg</td>
                  <td className="p-3 text-xs text-gray-500 font-mono">{t.operacion_id || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
```

---

## 6. Recomendaciones de UI/UX para el Panel de Producción

1. **Gráfico Temporal de Producción:**
   - Usa la propiedad `resumen_temporal` para alimentar un gráfico de barras apiladas o líneas con la evolución diaria (`kg_produccion` vs `kg_traslado`).
2. **Desglose de Lote Interactivo:**
   - Los elementos de `produccion_por_lote` pueden mostrarse como filas expandibles (acordeón) para ver las presentaciones individuales que componen cada lote.
3. **Exportación a Excel / CSV:**
   - Puedes exportar `movimientos_detalle` a formato Excel (.xlsx o .csv) en el frontend usando bibliotecas como `xlsx` o `papaparse`.
4. **Semáforo de Operaciones:**
   - Usa distintivos visuales (Badges): verde para `ensamblaje`/`produccion` y azul para `transferencia`.
