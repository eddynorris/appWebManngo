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

  getGastos(page: number = 1, per_page: number = 10): Observable<GastosResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', per_page.toString());
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
}
