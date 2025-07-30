import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { PresentacionProducto, Producto } from '../../../../types/contract.types';

export interface PresentacionesResponse {
  data: PresentacionProducto[];
  pagination: {
    total: number;
    page: number;
    per_page: number;
    pages: number;
  };
}

export interface PresentacionFormData {
  productos: Producto[];
}

@Injectable({
  providedIn: 'root',
})
export class PresentacionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/presentaciones`;

  // Obtener todas las presentaciones con paginación y filtros opcionales
  getPresentaciones(
    page: number = 1,
    limit: number = 10,
    filtros?: { [key: string]: string | number | boolean }
  ): Observable<PresentacionesResponse> {
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
    return this.http.get<PresentacionesResponse>(this.apiUrl, { params });
  }

  // Obtener datos necesarios para el formulario (productos)
  getFormData(): Observable<PresentacionFormData> {
    // Petición con paginación alta para obtener todos los productos
    const params = new HttpParams().set('limit', '1000'); // Limite alto para obtener todos
    
    const productos$ = this.http.get<{ data: Producto[] }>(`${environment.apiUrl}/productos`, { params });
    
    return forkJoin({
      productos: productos$
    }).pipe(
      map(({ productos }) => ({
        productos: productos.data || []
      }))
    );
  }

  // Obtener una presentación por ID
  getPresentacionById(id: number): Observable<PresentacionProducto> {
    return this.http.get<PresentacionProducto>(`${this.apiUrl}/${id}`);
  }

  // Crear una nueva presentación
  createPresentacion(presentacion: Omit<PresentacionProducto, 'id'>): Observable<PresentacionProducto> {
    return this.http.post<PresentacionProducto>(this.apiUrl, presentacion);
  }

  // Actualizar una presentación existente
  updatePresentacion(id: number, presentacion: Partial<PresentacionProducto>): Observable<PresentacionProducto> {
    return this.http.put<PresentacionProducto>(`${this.apiUrl}/${id}`, presentacion);
  }

  // Eliminar una presentación
  deletePresentacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}