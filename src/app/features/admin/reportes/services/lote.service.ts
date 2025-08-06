import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { LotesResponse } from '../../../../types/contract.types';

@Injectable({
  providedIn: 'root',
})
export class LoteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/lotes`;

  getLotes(page: number = 1, per_page: number = 100): Observable<LotesResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', per_page.toString());

    return this.http.get<LotesResponse>(this.apiUrl, { params });
  }
}