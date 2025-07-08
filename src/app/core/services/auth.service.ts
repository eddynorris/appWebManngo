import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../../types/auth.types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiUrl;

  isAuthenticated = signal<boolean>(!!this.getToken());

  login(username: string, password: string): Observable<boolean> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth`, { username, password })
      .pipe(
        tap((response) => {
          sessionStorage.setItem('authToken', response.access_token);
          this.isAuthenticated.set(true);
        }),
        map(() => true),
        catchError(() => of(false))
      );
  }

  logout(): void {
    sessionStorage.removeItem('authToken');
    this.isAuthenticated.set(false);
    this.router.navigate(['/admin/login']);
  }

  getToken(): string | null {
    return sessionStorage.getItem('authToken');
  }
}
