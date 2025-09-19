import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { 
  CierreCajaResponse, 
  CierreCajaFilters,
  RegistroDepositoRequest,
  RegistroDepositoResponse,
  PagoPendienteDeposito
} from '../../../../types/contract.types';

@Injectable({
  providedIn: 'root',
})
export class CierreCajaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/pagos`;

  /**
   * Obtiene el resumen y detalles del cierre de caja
   */
  getCierreCaja(filters: CierreCajaFilters): Observable<CierreCajaResponse> {
    let params = new HttpParams()
      .set('fecha_inicio', filters.fecha_inicio)
      .set('fecha_fin', filters.fecha_fin);

    if (filters.almacen_id) {
      params = params.set('almacen_id', filters.almacen_id.toString());
    }

    if (filters.usuario_id) {
      params = params.set('usuario_id', filters.usuario_id.toString());
    }

    return this.http.get<CierreCajaResponse>(`${this.apiUrl}/cierrecaja`, { params });
  }

  /**
   * Obtiene todos los pagos pendientes de depósito
   */
  getPagosPendientesDeposito(page: number = 1, perPage: number = 10, filters?: Partial<CierreCajaFilters>): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString())
      .set('depositado', 'false'); // Filtrar solo pagos no depositados

    if (filters?.fecha_inicio) {
      params = params.set('fecha_inicio', filters.fecha_inicio);
    }

    if (filters?.fecha_fin) {
      params = params.set('fecha_fin', filters.fecha_fin);
    }

    if (filters?.almacen_id) {
      params = params.set('almacen_id', filters.almacen_id.toString());
    }

    if (filters?.usuario_id) {
      params = params.set('usuario_id', filters.usuario_id.toString());
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Registra un depósito bancario
   */
  registrarDeposito(deposito: RegistroDepositoRequest): Observable<RegistroDepositoResponse> {
    return this.http.post<RegistroDepositoResponse>(`${environment.apiUrl}/pagos/depositos`, deposito);
  }
}