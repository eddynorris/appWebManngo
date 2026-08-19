import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { environment } from '../../../../../environments/environment';
import {
  IReporteProduccionEntradasResponse,
  IReporteProduccionFiltros
} from '../../../../types/produccion-reporte.types';

@Injectable({
  providedIn: 'root'
})
export class ProduccionReporteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Obtiene el reporte de producción y movimientos de entrada
   */
  getReporteProduccionEntradas(filtros: IReporteProduccionFiltros = {}): Observable<IReporteProduccionEntradasResponse> {
    let params = new HttpParams();

    if (filtros.fecha_inicio) {
      params = params.set('fecha_inicio', filtros.fecha_inicio);
    }
    if (filtros.fecha_fin) {
      params = params.set('fecha_fin', filtros.fecha_fin);
    }
    if (filtros.almacen_id !== undefined && filtros.almacen_id !== null) {
      params = params.set('almacen_id', filtros.almacen_id.toString());
    }
    if (filtros.lote_id !== undefined && filtros.lote_id !== null) {
      params = params.set('lote_id', filtros.lote_id.toString());
    }
    if (filtros.producto_id !== undefined && filtros.producto_id !== null) {
      params = params.set('producto_id', filtros.producto_id.toString());
    }
    if (filtros.presentacion_id !== undefined && filtros.presentacion_id !== null) {
      params = params.set('presentacion_id', filtros.presentacion_id.toString());
    }
    if (filtros.tipo_operacion && filtros.tipo_operacion !== 'todos') {
      params = params.set('tipo_operacion', filtros.tipo_operacion);
    }

    return this.http.get<IReporteProduccionEntradasResponse>(
      `${this.apiUrl}/reportes/produccion-entradas`,
      { params }
    );
  }

  /**
   * Exporta a formato Excel (.xlsx) con múltiples hojas detalladas
   */
  exportarReporteExcel(data: IReporteProduccionEntradasResponse, filtros: IReporteProduccionFiltros): void {
    const workbook = XLSX.utils.book_new();
    const fechaDescarga = new Date().toISOString().split('T')[0];

    const infoFiltros = [
      ['REPORTE DE PRODUCCIÓN Y ENTRADAS - MANNGO J&K'],
      [''],
      ['Rango de Fechas:', `${data.periodo.fecha_inicio} hasta ${data.periodo.fecha_fin}`],
      ['Tipo de Operación:', filtros.tipo_operacion || 'todos'],
      ['Fecha de Descarga:', new Date().toLocaleString('es-PE')],
      ['']
    ];

    // 1. Hoja: Resumen General
    const resumenData: any[][] = [
      ...infoFiltros,
      ['RESUMEN GENERAL'],
      ['Métrica', 'Unidades', 'Total (KG)', 'Lotes / Operaciones'],
      [
        'Total Ingresos Generales',
        data.resumen_general.total_unidades_ingresadas,
        data.resumen_general.total_kg_ingresados,
        '-'
      ],
      [
        'Producción / Ensamble',
        data.resumen_general.produccion.total_unidades,
        data.resumen_general.produccion.total_kg,
        `${data.resumen_general.produccion.total_lotes_utilizados || 0} lotes / ${data.resumen_general.produccion.total_operaciones} operaciones`
      ],
      [
        'Traslados entre Almacenes',
        data.resumen_general.traslados.total_unidades,
        data.resumen_general.traslados.total_kg,
        `${data.resumen_general.traslados.total_operaciones} operaciones`
      ]
    ];
    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    wsResumen['!cols'] = [{ width: 28 }, { width: 16 }, { width: 16 }, { width: 30 }];
    XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen General');

    // 2. Hoja: Producción por Lote
    if (data.produccion_por_lote && data.produccion_por_lote.length > 0) {
      const loteData: any[][] = [
        ...infoFiltros,
        ['PRODUCCIÓN POR LOTE'],
        ['Código Lote', 'Descripción', 'Producto', 'Unidades Producidas', 'Total KG', 'Operaciones', 'Detalle Presentaciones']
      ];

      data.produccion_por_lote.forEach(lote => {
        const detallePresentaciones = (lote.presentaciones || [])
          .map(p => `${p.presentacion_nombre}: ${p.unidades} und (${p.kg} kg)`)
          .join(' | ');

        loteData.push([
          lote.codigo_lote,
          lote.descripcion_lote || '-',
          lote.producto_nombre,
          lote.unidades_producidas,
          lote.kg_producidos,
          lote.operaciones_count,
          detallePresentaciones
        ]);
      });

      const wsLotes = XLSX.utils.aoa_to_sheet(loteData);
      wsLotes['!cols'] = [{ width: 16 }, { width: 26 }, { width: 20 }, { width: 18 }, { width: 14 }, { width: 14 }, { width: 45 }];
      XLSX.utils.book_append_sheet(workbook, wsLotes, 'Producción por Lote');
    }

    // 3. Hoja: Producción por Presentación
    if (data.produccion_por_presentacion && data.produccion_por_presentacion.length > 0) {
      const presData: any[][] = [
        ...infoFiltros,
        ['PRODUCCIÓN POR PRESENTACIÓN'],
        ['Presentación', 'Producto Base', 'Tipo', 'Capacidad KG', 'Unidades Producidas', 'Total KG', 'Lotes Involucrados']
      ];

      data.produccion_por_presentacion.forEach(pres => {
        presData.push([
          pres.presentacion_nombre,
          pres.producto_nombre,
          pres.tipo_presentacion || '-',
          pres.capacidad_kg || '-',
          pres.unidades_producidas,
          pres.kg_producidos,
          (pres.lotes_involucrados || []).join(', ')
        ]);
      });

      const wsPres = XLSX.utils.aoa_to_sheet(presData);
      wsPres['!cols'] = [{ width: 25 }, { width: 20 }, { width: 14 }, { width: 14 }, { width: 18 }, { width: 14 }, { width: 25 }];
      XLSX.utils.book_append_sheet(workbook, wsPres, 'Por Presentación');
    }

    // 4. Hoja: Traslados entre Almacenes
    if (data.traslados_entre_almacenes && data.traslados_entre_almacenes.length > 0) {
      const trasladosData: any[][] = [
        ...infoFiltros,
        ['TRASLADOS ENTRE ALMACENES'],
        ['Fecha', 'Almacén Origen', 'Almacén Destino', 'Presentación', 'Lote', 'Cantidad Und.', 'Total KG', 'Operación ID', 'Usuario', 'Motivo']
      ];

      data.traslados_entre_almacenes.forEach(t => {
        trasladosData.push([
          t.fecha ? new Date(t.fecha).toLocaleString('es-PE') : '-',
          t.almacen_origen,
          t.almacen_destino,
          t.presentacion_nombre,
          t.codigo_lote,
          t.cantidad_unidades,
          t.total_kg,
          t.operacion_id || '-',
          t.usuario_nombre || '-',
          t.motivo || '-'
        ]);
      });

      const wsTraslados = XLSX.utils.aoa_to_sheet(trasladosData);
      wsTraslados['!cols'] = [{ width: 18 }, { width: 20 }, { width: 20 }, { width: 22 }, { width: 15 }, { width: 14 }, { width: 12 }, { width: 15 }, { width: 16 }, { width: 30 }];
      XLSX.utils.book_append_sheet(workbook, wsTraslados, 'Traslados');
    }

    // 5. Hoja: Detalle de Movimientos
    if (data.movimientos_detalle && data.movimientos_detalle.length > 0) {
      const movsData: any[][] = [
        ...infoFiltros,
        ['MOVIMIENTOS DE ENTRADA (DETALLE)'],
        ['ID', 'Fecha', 'Tipo Operación', 'Almacén', 'Presentación', 'Producto', 'Lote', 'Cantidad Und.', 'Total KG', 'Usuario', 'Motivo']
      ];

      data.movimientos_detalle.forEach(m => {
        movsData.push([
          m.id,
          m.fecha ? new Date(m.fecha).toLocaleString('es-PE') : '-',
          m.tipo_operacion,
          m.almacen_nombre,
          m.presentacion_nombre,
          m.producto_nombre,
          m.codigo_lote,
          m.cantidad_unidades,
          m.total_kg,
          m.usuario_nombre || '-',
          m.motivo || '-'
        ]);
      });

      const wsMovs = XLSX.utils.aoa_to_sheet(movsData);
      wsMovs['!cols'] = [{ width: 8 }, { width: 18 }, { width: 16 }, { width: 20 }, { width: 22 }, { width: 18 }, { width: 15 }, { width: 14 }, { width: 12 }, { width: 16 }, { width: 30 }];
      XLSX.utils.book_append_sheet(workbook, wsMovs, 'Detalle Movimientos');
    }

    const fileName = `reporte-produccion-entradas-${fechaDescarga}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }
}
