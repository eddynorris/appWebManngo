import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { MovimientosResponse } from '../../../../types/contract.types';

@Injectable({
  providedIn: 'root',
})
export class MovimientoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/movimientos`;

  getMovimientosFiltrados(filtros: {
    tipo?: string;
    lote_id?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
    page?: number;
    per_page?: number;
    limit?: number;
  }): Observable<MovimientosResponse> {
    let params = new HttpParams()
      .set('page', (filtros.page || 1).toString())
      .set('per_page', (filtros.per_page || 100).toString())
      .set('limit', (filtros.limit || 100).toString());

    if (filtros.tipo) {
      params = params.set('tipo', filtros.tipo);
    }
    if (filtros.lote_id) {
      params = params.set('lote_id', filtros.lote_id.toString());
    }
    if (filtros.fecha_inicio) {
      params = params.set('fecha_inicio', filtros.fecha_inicio);
    }
    if (filtros.fecha_fin) {
      params = params.set('fecha_fin', filtros.fecha_fin);
    }

    return this.http.get<MovimientosResponse>(this.apiUrl, { params });
  }
}
