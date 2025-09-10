import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Pago, PagosResponse } from '../../../../types/contract.types';

@Injectable({
  providedIn: 'root',
})
export class PagoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/pagos`;

  getPagos(page: number = 1, per_page: number = 10): Observable<PagosResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', per_page.toString());
    return this.http.get<PagosResponse>(this.apiUrl, { params });
  }

  getPagoById(id: number): Observable<Pago> {
    return this.http.get<Pago>(`${this.apiUrl}/${id}`);
  }

  createPago(pago: Omit<Pago, 'id'>): Observable<Pago> {
    return this.http.post<Pago>(this.apiUrl, pago);
  }

  updatePago(id: number, pago: Partial<Pago>): Observable<Pago> {
    return this.http.put<Pago>(`${this.apiUrl}/${id}`, pago);
  }

  deletePago(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Obtener todos los pagos asociados a una venta específica
  getPagosByVentaId(ventaId: number): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.apiUrl}/venta/${ventaId}`);
  }

  // Crear pagos por lotes con soporte para archivo adjunto
  createBatchPagos(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/batch`, formData);
  }

  // Exportar pagos a Excel
  exportarPagos(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar`, {
      responseType: 'blob'
    });
  }
}
