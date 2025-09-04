import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ProduccionEnsamblaje } from '../../../../types/dashboard.types';

@Injectable({
  providedIn: 'root'
})
export class ProduccionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/produccion`;

  /**
   * Crear registro de producción por ensamblaje
   */
  
  createEnsamblaje(data: ProduccionEnsamblaje): Observable<any> {
    return this.http.post(`${this.apiUrl}/ensamblaje`, data);
  }

  createFabricacion(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }
}
