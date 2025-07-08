import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Venta, VentasResponse, VentaFormDataResponse } from '../../../../types/contract.types';

@Injectable({
  providedIn: 'root',
})
export class VentaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/ventas`;

  // Obtener todas las ventas con paginación y filtros opcionales
  getVentas(
    page: number = 1,
    limit: number = 10,
    filtros?: { [key: string]: string | number | boolean }
  ): Observable<VentasResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filtros) {
      Object.keys(filtros).forEach(key => {
        const value = filtros[key];
        if (value !== null && value !== undefined) {
          params = params.append(key, String(value));
        }
      });
    }
    return this.http.get<VentasResponse>(this.apiUrl, { params });
  }

  getVentaFormData(almacenId?: number): Observable<VentaFormDataResponse> {
    let params = new HttpParams();
    if (almacenId) {
      params = params.set('almacen_id', almacenId.toString());
    }
    return this.http.get<VentaFormDataResponse>(`${this.apiUrl}/form-data`, { params });
  }

  // Obtener una venta por ID
  getVentaById(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.apiUrl}/${id}`);
  }

  // Crear una nueva venta
  createVenta(venta: Omit<Venta, 'id'>): Observable<Venta> {
    return this.http.post<Venta>(this.apiUrl, venta);
  }

  // Actualizar una venta existente
  updateVenta(id: number, venta: Partial<Venta>): Observable<Venta> {
    return this.http.put<Venta>(`${this.apiUrl}/${id}`, venta);
  }

  // Eliminar una venta (generalmente no se elimina, se cancela)
  cancelVenta(id: number): Observable<Venta> {
    return this.http.patch<Venta>(`${this.apiUrl}/${id}/cancelar`, {});
  }

  // Actualizar el estado de pago de una venta
  updateEstadoPago(id: number, estado: string): Observable<Venta> {
    return this.http.patch<Venta>(`${this.apiUrl}/${id}/estado-pago`, { estado_pago: estado });
  }
}
