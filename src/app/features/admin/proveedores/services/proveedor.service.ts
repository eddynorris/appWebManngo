import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Proveedor } from '../../../../types/contract.types';

export interface ProveedoresResponse {
  data: Proveedor[];
  pagination: {
    total: number;
    page: number;
    per_page: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ProveedorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/proveedores`;

  // Obtener todos los proveedores con paginación y filtros opcionales
  getProveedores(
    page: number = 1,
    limit: number = 10,
    filtros?: { [key: string]: string | number | boolean }
  ): Observable<ProveedoresResponse> {
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
    return this.http.get<ProveedoresResponse>(this.apiUrl, { params });
  }

  // Obtener un proveedor por ID
  getProveedorById(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo proveedor
  createProveedor(proveedor: Omit<Proveedor, 'id'>): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.apiUrl, proveedor);
  }

  // Actualizar un proveedor existente
  updateProveedor(id: number, proveedor: Partial<Proveedor>): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.apiUrl}/${id}`, proveedor);
  }

  // Eliminar un proveedor
  deleteProveedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}