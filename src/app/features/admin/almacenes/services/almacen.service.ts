import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Almacen } from '../../../../types/contract.types';

@Injectable({
  providedIn: 'root',
})
export class AlmacenService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/almacenes`;

  // Obtener todos los almacenes para listas desplegables
  getAlmacenes(): Observable<Almacen[]> {
    return this.http.get<Almacen[]>(this.apiUrl);
  }
}
