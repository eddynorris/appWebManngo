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

export interface IReporteProduccionFiltros {
  fecha_inicio?: string;
  fecha_fin?: string;
  almacen_id?: number;
  lote_id?: number;
  producto_id?: number;
  presentacion_id?: number;
  tipo_operacion?: 'todos' | 'produccion' | 'transferencia';
}
