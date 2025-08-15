import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Cliente, ClientesResponse, ClienteProyeccion, ClienteProyeccionesResponse } from '../../../../types/contract.types';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/clientes`;

  // Obtener todos los clientes con paginación
  getClientes(page: number = 1, per_page: number = 10, search?: string, ciudad?: string): Observable<ClientesResponse> {
    const params: any = {
      page: page.toString(),
      per_page: per_page.toString(),
    };

    if (search) {
      params.search = search;
    }

    if (ciudad) {
      params.ciudad = ciudad;
    }

    return this.http.get<ClientesResponse>(this.apiUrl, { params });
  }

  // Obtener un cliente por ID
  getClienteById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo cliente
  createCliente(cliente: Omit<Cliente, 'id'>): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  // Actualizar un cliente existente
  updateCliente(id: number, cliente: Partial<Cliente>): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }

  // Eliminar un cliente
  deleteCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Activar/Desactivar un cliente (si la API lo soporta)
  // Ejemplo: /api/clientes/1/toggle-status
  toggleClienteStatus(id: number, status: boolean): Observable<Cliente> {
    // Nota: La URL exacta puede variar según tu API
    return this.http.patch<Cliente>(`${this.apiUrl}/${id}/status`, { activo: status });
  }

  // --- Métodos para Proyecciones de Clientes ---

  // Obtener lista paginada de proyecciones de clientes
  getClientesProyecciones(page: number = 1, per_page: number = 10, search?: string, dateFilter?: string): Observable<ClienteProyeccionesResponse> {
    const params: any = {
      page: page.toString(),
      per_page: per_page.toString(),
    };

    if (search) {
      params.search = search;
    }

    if (dateFilter) {
      params.filtro_fecha = dateFilter;
    }

    return this.http.get<ClienteProyeccionesResponse>(`${this.apiUrl}/proyecciones`, { params });
  }

  // Obtener proyección detallada de un cliente específico
  getClienteProyeccion(id: number): Observable<ClienteProyeccion> {
    return this.http.get<ClienteProyeccion>(`${this.apiUrl}/proyecciones/${id}`);
  }

  // Exportar clientes a Excel
  exportarClientes(ciudad?: string): Observable<Blob> {
    const params: any = {};

    if (ciudad) {
      params.ciudad = ciudad;
    }

    return this.http.get(`${this.apiUrl}/exportar`, {
      params,
      responseType: 'blob'
    });
  }
}
