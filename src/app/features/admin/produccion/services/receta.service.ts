import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { PaginatedResponse } from '../../../../types/contract.types';

// Interfaces para las recetas según stepsnew.md
export interface ComponenteReceta {
  id?: number;
  receta_id?: number;
  componente_presentacion_id: number;
  cantidad_necesaria: string | number;
  tipo_consumo: 'materia_prima' | 'insumo';
  componente_presentacion?: {
    id: number;
    nombre: string;
    producto?: {
      nombre: string;
    };
  };
  // Mantener compatibilidad con estructura anterior
  presentacion?: {
    id: number;
    nombre: string;
    producto?: {
      id: number;
      nombre: string;
    };
  };
}

export interface Receta {
  id?: number;
  presentacion_id: number;
  nombre: string;
  descripcion?: string;
  componentes: ComponenteReceta[];
  created_at?: string;
  updated_at?: string;
}

export type RecetasResponse = PaginatedResponse<Receta>;

export interface RecetaFormData {
  presentaciones: any[];
}

@Injectable({
  providedIn: 'root',
})
export class RecetaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/recetas`;

  /**
   * Obtener todas las recetas con paginación y filtros opcionales
   */
  getRecetas(
    page: number = 1,
    per_page: number = 10,
    filtros?: { [key: string]: string | number | boolean }
  ): Observable<RecetasResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', per_page.toString());

    if (filtros) {
      Object.keys(filtros).forEach(key => {
        const value = filtros[key];
        if (value !== null && value !== undefined) {
          params = params.append(key, String(value));
        }
      });
    }

    return this.http.get<RecetasResponse>(this.apiUrl, { params });
  }

  /**
   * Exportar recetas a Excel
   */
  exportarRecetas(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, { responseType: 'blob' });
  }

  /**
   * Obtener todas las recetas activas (sin paginación)
   */
  getRecetasActivas(): Observable<Receta[]> {
    const params = new HttpParams()
      .set('activo', 'true')
      .set('per_page', '1000'); // Número alto para obtener todas
    
    return this.http.get<RecetasResponse>(this.apiUrl, { params }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtener una receta por ID
   */
  getRecetaById(id: number): Observable<Receta> {
    return this.http.get<Receta>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear una nueva receta
   */
  createReceta(receta: Omit<Receta, 'id' | 'created_at' | 'updated_at'>): Observable<Receta> {
    return this.http.post<Receta>(this.apiUrl, receta);
  }

  /**
   * Actualizar una receta existente
   */
  updateReceta(id: number, receta: Partial<Receta>): Observable<Receta> {
    return this.http.put<Receta>(`${this.apiUrl}/${id}`, receta);
  }

  /**
   * Eliminar una receta
   */
  deleteReceta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cambiar estado activo/inactivo de una receta
   */
  toggleRecetaStatus(id: number, activo: boolean): Observable<Receta> {
    return this.http.patch<Receta>(`${this.apiUrl}/${id}/status`, { activo });
  }

  /**
   * Obtener receta por presentación
   */
  obtenerRecetaPorPresentacion(presentacionId: number): Observable<Receta | null> {
    const params = new HttpParams().set('presentacion_id', presentacionId.toString());
    return this.http.get<Receta[]>(this.apiUrl, { params }).pipe(
      map(recetas => recetas && recetas.length > 0 ? recetas[0] : null)
    );
  }
}