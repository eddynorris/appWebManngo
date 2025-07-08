import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Almacen, PaginatedResponse } from '../../../../types/contract.types';

@Injectable({
  providedIn: 'root',
})
export class AlmacenService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/almacenes`;

  // Obtener todos los almacenes para listas desplegables
  getAlmacenes(): Observable<Almacen[]> {
    return this.http.get<PaginatedResponse<Almacen>>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }
}
