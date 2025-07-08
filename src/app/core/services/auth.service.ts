import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

import { environment } from '../../../environments/environment';
import { AuthResponse, DecodedToken } from '../../types/auth.types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiUrl;

  private readonly tokenKey = 'authToken';

  // Señal para el token decodificado
  currentUser = signal<DecodedToken | null>(this.getDecodedToken());

  // Señal computada para saber si el usuario está autenticado
  isAuthenticated = computed(() => !!this.currentUser());

  login(username: string, password: string): Observable<boolean> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth`, { username, password })
      .pipe(
        tap((response) => this.setSession(response.access_token)),
        map(() => true),
        catchError(() => of(false))
      );
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    this.currentUser.set(null);
    this.router.navigate(['/admin/login']);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  private setSession(token: string): void {
    sessionStorage.setItem(this.tokenKey, token);
    this.currentUser.set(this.getDecodedToken());
  }

  private getDecodedToken(): DecodedToken | null {
    const token = this.getToken();
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        // Verificar si el token ha expirado
        if (decoded.exp * 1000 > Date.now()) {
          return decoded;
        }
      } catch (error) {
        console.error('Error decodificando el token:', error);
        return null;
      }
    }
    return null;
  }

  // --- Métodos de utilidad para roles ---

  isAdmin(): boolean {
    return this.currentUser()?.rol === 'admin';
  }

  isUserInRole(role: 'admin' | 'usuario' | 'almacenero'): boolean {
    return this.currentUser()?.rol === role;
  }
}
