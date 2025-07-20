import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Inventario, InventariosResponse } from '../../../../types/contract.types';

@Injectable({
  providedIn: 'root',
})
export class InventarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/inventarios`;

  getInventarios(page: number = 1, limit: number = 10, almacenId?: number): Observable<InventariosResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

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
}
