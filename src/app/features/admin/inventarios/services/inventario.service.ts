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

// Interfaces for transfers
export interface Almacen {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface LoteInfo {
  id: number;
  codigo_lote: string;
  descripcion: string;
}

export interface InventarioTransferencia {
  almacen_id: number;
  almacen_nombre: string;
  stock_disponible: number;
  lote_id: number;
  lote_info: LoteInfo;
}

export interface PresentacionDisponible {
  id: number;
  nombre: string;
  url_foto: string;
  inventarios: InventarioTransferencia[];
}

export interface TransferenciasData {
  almacenes: Almacen[];
  presentaciones_disponibles: PresentacionDisponible[];
}

export interface TransferenciaItem {
  presentacion_id: number;
  lote_id: number;
  cantidad: string;
}

export interface TransferenciaRequest {
  almacen_origen_id: number;
  almacen_destino_id: number;
  transferencias: TransferenciaItem[];
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

  // Obtener datos para transferencias (almacenes y presentaciones disponibles)
  getTransferenciasData(): Observable<TransferenciasData> {
    return this.http.get<TransferenciasData>(`${environment.apiUrl}/inventario/transferir`);
  }

  // Realizar transferencia de inventario
  realizarTransferencia(transferencia: TransferenciaRequest): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/inventario/transferir`, transferencia);
  }
}
