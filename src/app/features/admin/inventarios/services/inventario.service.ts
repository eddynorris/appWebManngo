import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Inventario, InventariosResponse } from '../../../../types/contract.types';

// Interface for global inventory report
export interface ReporteInventarioGlobalItem {
  presentacion_id: number;
  nombre_presentacion: string;
  stock_total_unidades: number;
  proyeccion_venta: number;
  detalle_por_almacen: {
    almacen: string;
    lote_id: number;
    lote: string;
    lote_kg_disponible: number;
    stock: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class InventarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/inventarios`;

  getInventarios(page: number = 1, per_page: number = 10, almacenId?: number): Observable<InventariosResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', per_page.toString());

    if (almacenId) {
      params = params.set('almacen_id', almacenId.toString());
    }

    return this.http.get<InventariosResponse>(this.apiUrl, { params });
  }

  updateInventario(inventarioId: number, data: {
    cantidad: number;
    motivo?: string;
    lote_id?: number;
    stock_minimo?: number;
  }): Observable<Inventario> {
    return this.http.put<Inventario>(`${this.apiUrl}/${inventarioId}`, data);
  }

  // Obtener reporte global de inventario
  getReporteGlobal(): Observable<ReporteInventarioGlobalItem[]> {
    return this.http.get<ReporteInventarioGlobalItem[]>(`${environment.apiUrl}/inventario/reporte-global`);
  }
}
