import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Cliente, ClientesResponse, ClienteProyeccion, ClienteProyeccionesResponse, ClienteProyeccionDetalle } from '../../../../types/contract.types';

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
  getClientesProyecciones(
    page: number = 1,
    per_page: number = 10,
    search?: string,
    ciudad?: string,
    solo_con_proyeccion?: boolean,
    fecha_desde?: string,
    fecha_hasta?: string,
    order_by?: 'ultima_compra' | 'saldo' | 'nombre' | 'frecuencia'
  ): Observable<ClienteProyeccionesResponse> {
    const params: any = {
      page: page.toString(),
      per_page: per_page.toString(),
    };

    if (search) params.search = search;
    if (ciudad) params.ciudad = ciudad;
    if (solo_con_proyeccion !== undefined) params.solo_con_proyeccion = solo_con_proyeccion;
    if (fecha_desde) params.fecha_desde = fecha_desde;
    if (fecha_hasta) params.fecha_hasta = fecha_hasta;
    if (order_by) params.order_by = order_by;

    return this.http.get<ClienteProyeccionesResponse>(`${this.apiUrl}/proyecciones`, { params });
  }

  // Obtener proyección detallada de un cliente específico por código
  getClienteProyeccionDetalle(codigo: string): Observable<ClienteProyeccionDetalle> {
    return this.http.get<ClienteProyeccionDetalle>(`${this.apiUrl}/proyecciones/${codigo}`);
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

  // Exportar proyecciones de clientes a Excel
  exportarProyecciones(
    search?: string,
    ciudad?: string,
    solo_con_proyeccion?: boolean,
    fecha_desde?: string,
    fecha_hasta?: string,
    order_by?: 'ultima_compra' | 'saldo' | 'nombre' | 'frecuencia'
  ): Observable<Blob> {
    const params: any = {};

    if (search) params.search = search;
    if (ciudad) params.ciudad = ciudad;
    if (solo_con_proyeccion !== undefined) params.solo_con_proyeccion = solo_con_proyeccion;
    if (fecha_desde) params.fecha_desde = fecha_desde;
    if (fecha_hasta) params.fecha_hasta = fecha_hasta;
    if (order_by) params.order_by = order_by;

    return this.http.get(`${this.apiUrl}/proyecciones/exportar`, {
      params,
      responseType: 'blob'
    });
  }
}
