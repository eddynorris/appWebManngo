import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import * as XLSX from 'xlsx';

export interface FiltrosReporte {
  fecha_inicio?: string;
  fecha_fin?: string;
  almacen_id?: number;
  lote_id?: number;
}

export interface VentaPorPresentacion {
  id?: number;
  activo?: boolean;
  presentacion_id: number;
  presentacion_nombre: string;
  unidades_vendidas: number;
  total_vendido: string;
}

export interface ResumenFinanciero {
  total_ventas: string;
  total_gastos: string;
  ganancia_neta: string;
  margen_ganancia: string;
  numero_ventas: number;
  numero_gastos: number;
  total_deuda: string;
  total_pagado: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReporteFinancieroService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Obtiene reporte de ventas por presentación
   * Endpoint: GET /reportes/ventas-presentacion
   */
  obtenerVentasPorPresentacion(filtros: FiltrosReporte): Observable<VentaPorPresentacion[]> {
    let params = new HttpParams();

    if (filtros.fecha_inicio) {
      params = params.set('fecha_inicio', filtros.fecha_inicio);
    }
    if (filtros.fecha_fin) {
      params = params.set('fecha_fin', filtros.fecha_fin);
    }
    if (filtros.almacen_id) {
      params = params.set('almacen_id', filtros.almacen_id.toString());
    }
    if (filtros.lote_id) {
      params = params.set('lote_id', filtros.lote_id.toString());
    }

    return this.http.get<VentaPorPresentacion[]>(`${this.apiUrl}/reportes/ventas-presentacion`, { params });
  }

  /**
   * Obtiene resumen financiero completo
   * Endpoint: GET /reportes/resumen-financiero
   */
  obtenerResumenFinanciero(filtros: FiltrosReporte): Observable<ResumenFinanciero> {
    let params = new HttpParams();

    if (filtros.fecha_inicio) {
      params = params.set('fecha_inicio', filtros.fecha_inicio);
    }
    if (filtros.fecha_fin) {
      params = params.set('fecha_fin', filtros.fecha_fin);
    }
    if (filtros.almacen_id) {
      params = params.set('almacen_id', filtros.almacen_id.toString());
    }
    if (filtros.lote_id) {
      params = params.set('lote_id', filtros.lote_id.toString());
    }

    return this.http.get<ResumenFinanciero>(`${this.apiUrl}/reportes/resumen-financiero`, { params });
  }

  // Utilidades para formateo
  parseMontoString(monto: string): number {
    return parseFloat(monto) || 0;
  }

  formatearMoneda(monto: number | string): string {
    const valor = typeof monto === 'string' ? this.parseMontoString(monto) : monto;
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor);
  }

  formatearPorcentaje(porcentaje: string): string {
    const valor = parseFloat(porcentaje.replace('%', '')) || 0;
    return `${valor.toFixed(2)}%`;
  }

  /**
   * Exporta reporte de ventas por presentación a CSV
   */
  exportarVentasPresentacionCSV(ventas: VentaPorPresentacion[], filtros: FiltrosReporte): string {
    let csv = 'REPORTE DE VENTAS POR PRESENTACIÓN\n\n';
    
    csv += `Período:,${filtros.fecha_inicio || 'No especificado'},${filtros.fecha_fin || 'No especificado'}\n`;
    csv += `Almacén:,${filtros.almacen_id || 'Todos'}\n`;
    csv += `Lote:,${filtros.lote_id || 'Todos'}\n`;
    csv += `Generado:,${new Date().toLocaleString('es-PE')}\n\n`;
    
    csv += 'DETALLE DE VENTAS POR PRESENTACIÓN\n';
    csv += 'ID Presentación,Presentación,Unidades Vendidas,Total Vendido\n';
    
    ventas.forEach(venta => {
      csv += `${venta.presentacion_id},${venta.presentacion_nombre},${venta.unidades_vendidas},${venta.total_vendido}\n`;
    });

    // Totales
    const totalUnidades = ventas.reduce((sum, v) => sum + v.unidades_vendidas, 0);
    const totalVendido = ventas.reduce((sum, v) => sum + this.parseMontoString(v.total_vendido), 0);
    
    csv += '\nTOTALES\n';
    csv += `Total Unidades:,${totalUnidades}\n`;
    csv += `Total Vendido:,${totalVendido.toFixed(2)}\n`;
    
    return csv;
  }

  /**
   * Exporta resumen financiero a CSV
   */
  exportarResumenFinancieroCSV(resumen: ResumenFinanciero, filtros: FiltrosReporte): string {
    let csv = 'RESUMEN FINANCIERO\n\n';
    
    csv += `Período:,${filtros.fecha_inicio || 'No especificado'},${filtros.fecha_fin || 'No especificado'}\n`;
    csv += `Almacén:,${filtros.almacen_id || 'Todos'}\n`;
    csv += `Lote:,${filtros.lote_id || 'Todos'}\n`;
    csv += `Generado:,${new Date().toLocaleString('es-PE')}\n\n`;
    
    csv += 'RESUMEN FINANCIERO\n';
    csv += `Total Ventas,${resumen.total_ventas}\n`;
    csv += `Total Gastos,${resumen.total_gastos}\n`;
    csv += `Ganancia Neta,${resumen.ganancia_neta}\n`;
    csv += `Margen de Ganancia,${resumen.margen_ganancia}\n`;
    csv += `Total Deuda,${resumen.total_deuda}\n`;
    csv += `Total Pagado,${resumen.total_pagado}\n`;
    csv += `Número de Ventas,${resumen.numero_ventas}\n`;
    csv += `Número de Gastos,${resumen.numero_gastos}\n`;
    
    return csv;
  }

  /**
   * Exporta reporte completo a XLSX con ambos reportes
   */
  exportarReporteCompleto(resumen: ResumenFinanciero | null, ventas: VentaPorPresentacion[], filtros: FiltrosReporte): void {
    const workbook = XLSX.utils.book_new();
    const fechaActual = new Date().toISOString().split('T')[0];
    
    // Información general del reporte
    const infoGeneral = [
      ['REPORTE FINANCIERO COMPLETO'],
      [''],
      ['Período:', filtros.fecha_inicio || 'No especificado', 'hasta', filtros.fecha_fin || 'No especificado'],
      ['Almacén:', filtros.almacen_id || 'Todos'],
      ['Lote:', filtros.lote_id || 'Todos'],
      ['Generado:', new Date().toLocaleString('es-PE')],
      ['']
    ];

    // Hoja 1: Resumen Financiero
    if (resumen) {
      const resumenData = [
        ...infoGeneral,
        ['RESUMEN FINANCIERO'],
        [''],
        ['Concepto', 'Valor'],
        ['Total Ventas', resumen.total_ventas],
        ['Total Gastos', resumen.total_gastos],
        ['Ganancia Neta', resumen.ganancia_neta],
        ['Margen de Ganancia', resumen.margen_ganancia],
        ['Total Deuda', resumen.total_deuda],
        ['Total Pagado', resumen.total_pagado],
        ['Número de Ventas', resumen.numero_ventas],
        ['Número de Gastos', resumen.numero_gastos]
      ];
      
      const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
      
      // Aplicar formato a la hoja de resumen
      wsResumen['!cols'] = [{ width: 20 }, { width: 15 }];
      
      XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen Financiero');
    }

    // Hoja 2: Ventas por Presentación
    if (ventas.length > 0) {
      const ventasData = [
        ...infoGeneral,
        ['VENTAS POR PRESENTACIÓN'],
        [''],
        ['ID Presentación', 'Presentación', 'Unidades Vendidas', 'Total Vendido']
      ];
      
      // Agregar datos de ventas
      ventas.forEach(venta => {
        ventasData.push([
          venta.presentacion_id,
          venta.presentacion_nombre,
          venta.unidades_vendidas,
          venta.total_vendido
        ]);
      });
      
      // Agregar totales
      const totalUnidades = ventas.reduce((sum, v) => sum + v.unidades_vendidas, 0);
      const totalVendido = ventas.reduce((sum, v) => sum + this.parseMontoString(v.total_vendido), 0);
      
      ventasData.push(
        [''],
        ['TOTALES'],
        ['Total Unidades:', totalUnidades],
        ['Total Vendido:', this.formatearMoneda(totalVendido)]
      );
      
      const wsVentas = XLSX.utils.aoa_to_sheet(ventasData);
      
      // Aplicar formato a la hoja de ventas
      wsVentas['!cols'] = [{ width: 15 }, { width: 25 }, { width: 18 }, { width: 15 }];
      
      XLSX.utils.book_append_sheet(workbook, wsVentas, 'Ventas por Presentación');
    }

    // Generar y descargar archivo
    const fileName = `reporte-financiero-${fechaActual}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }
}