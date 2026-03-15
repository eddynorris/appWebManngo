import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Gasto, GastosResponse } from '../../../../types/contract.types';

@Injectable({
  providedIn: 'root',
})
export class GastoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/gastos`;

  getGastos(page: number = 1, per_page: number = 10, filters: any = {}): Observable<GastosResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', per_page.toString());

    if (filters.categoria) params = params.set('categoria', filters.categoria);
    if (filters.fecha_inicio) params = params.set('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params = params.set('fecha_fin', filters.fecha_fin);
    if (filters.almacen_id) params = params.set('almacen_id', filters.almacen_id);
    if (filters.usuario_id) params = params.set('usuario_id', filters.usuario_id);
    if (filters.lote_id) params = params.set('lote_id', filters.lote_id);
    if (filters.sort_by) params = params.set('sort_by', filters.sort_by);
    if (filters.sort_order) params = params.set('sort_order', filters.sort_order);

    return this.http.get<GastosResponse>(this.apiUrl, { params });
  }

  getGastoById(id: number): Observable<Gasto> {
    return this.http.get<Gasto>(`${this.apiUrl}/${id}`);
  }

  createGasto(gasto: Omit<Gasto, 'id'>): Observable<Gasto> {
    return this.http.post<Gasto>(this.apiUrl, gasto);
  }

  updateGasto(id: number, gasto: Partial<Gasto>): Observable<Gasto> {
    return this.http.put<Gasto>(`${this.apiUrl}/${id}`, gasto);
  }

  deleteGasto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Exportar gastos a Excel
  exportarGastos(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar`, {
      responseType: 'blob'
    });
  }
}
