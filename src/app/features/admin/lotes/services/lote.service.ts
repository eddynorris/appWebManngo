import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { Lote, Producto, Proveedor, LotesResponse } from '../../../../types/contract.types';

export interface LoteFormData {
  productos: Producto[];
  proveedores: Proveedor[];
}

@Injectable({
  providedIn: 'root',
})
export class LoteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/lotes`;

  getLotes(page: number = 1, per_page: number = 10, filtros?: { [key: string]: string | number | boolean }): Observable<LotesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', per_page.toString());
    
    // Agregar filtros adicionales si se proporcionan
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        const value = filtros[key];
        if (value !== null && value !== undefined) {
          params = params.set(key, String(value));
        }
      });
    }
    
    return this.http.get<LotesResponse>(this.apiUrl, { params });
  }

  // Obtener datos necesarios para el formulario (productos y proveedores)
  getFormData(): Observable<LoteFormData> {
    // Peticiones con paginación alta para obtener todos los registros
    const params = new HttpParams().set('per_page', '1000'); // per_pagee alto para obtener todos
    
    const productos$ = this.http.get<{ data: Producto[] }>(`${environment.apiUrl}/productos`, { params });
    const proveedores$ = this.http.get<{ data: Proveedor[] }>(`${environment.apiUrl}/proveedores`, { params });
    
    return forkJoin({
      productos: productos$,
      proveedores: proveedores$
    }).pipe(
      map(({ productos, proveedores }) => ({
        productos: productos.data || [],
        proveedores: proveedores.data || []
      }))
    );
  }

  // Obtener un lote por ID
  getLoteById(id: number): Observable<Lote> {
    return this.http.get<Lote>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo lote
  createLote(lote: Omit<Lote, 'id'>): Observable<Lote> {
    return this.http.post<Lote>(this.apiUrl, lote);
  }

  // Actualizar un lote existente
  updateLote(id: number, lote: Partial<Lote>): Observable<Lote> {
    return this.http.put<Lote>(`${this.apiUrl}/${id}`, lote);
  }

  // Eliminar un lote
  deleteLote(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}