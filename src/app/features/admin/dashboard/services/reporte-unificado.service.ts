import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface FiltrosReporteUnificado {
    fecha_inicio?: string;
    fecha_fin?: string;
    almacen_id?: number;
    lote_id?: number;
}

export interface ResumenFinanciero {
    total_ventas: string;
    total_gastos: string;
    ganancia_neta: string;
    margen_ganancia: string;
    total_deuda: string;
    total_pagado: string;
    numero_ventas: number;
    numero_gastos: number;
}

export interface KPI {
    total_kg_vendidos: number;
    total_unidades_vendidas: number;
    valor_inventario_actual: number;
}

export interface VentaPresentacion {
    presentacion_id: number;
    presentacion_nombre: string;
    unidades_vendidas: number;
    total_vendido: string;
    kg_vendidos: number;
}

export interface DetalleAlmacen {
    almacen: string;
    cantidad: number;
    lote_id?: number;
    lote_kg_disponible?: number;
}

export interface InventarioActual {
    presentacion_id: number;
    presentacion_nombre: string;
    stock_unidades: number;
    stock_kg: number;
    valor_estimado: string;
    detalle_almacenes: DetalleAlmacen[];
    proyeccion_venta?: number;
}

export interface ReporteUnificadoResponse {
    resumen_financiero: ResumenFinanciero;
    kpis: KPI;
    ventas_por_presentacion: VentaPresentacion[];
    inventario_actual: InventarioActual[];
}

@Injectable({
    providedIn: 'root'
})
export class ReporteUnificadoService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    obtenerReporteUnificado(filtros: FiltrosReporteUnificado): Observable<ReporteUnificadoResponse> {
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

        return this.http.get<ReporteUnificadoResponse>(`${this.apiUrl}/reportes/unificado`, { params });
    }
}
