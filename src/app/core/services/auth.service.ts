import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

import { environment } from '../../../environments/environment';
import { AuthResponse, DecodedToken, User } from '../../types/auth.types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiUrl;

  private readonly tokenKey = 'authToken';
  private readonly userKey = 'authUser';

  // Señal para el usuario actual
  currentUser = signal<User | null>(this.getUserFromStorage());

  // Señal computada para saber si el usuario está autenticado
  isAuthenticated = computed(() => !!this.currentUser() && this.isTokenValid());

  login(username: string, password: string): Observable<boolean> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth`, { username, password })
      .pipe(
        tap((response) => this.setSession(response)),
        map(() => true),
        catchError(() => of(false))
      );
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
    this.currentUser.set(null);
    this.router.navigate(['/admin/login']);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  private setSession(response: AuthResponse): void {
    sessionStorage.setItem(this.tokenKey, response.access_token);
    sessionStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.currentUser.set(response.user);
  }

  private getUserFromStorage(): User | null {
    const userStr = sessionStorage.getItem(this.userKey);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  private isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const decoded: DecodedToken = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  // --- Métodos de utilidad para roles ---

  isAdmin(): boolean {
    return this.currentUser()?.rol === 'admin';
  }

  isUserInRole(role: 'admin' | 'usuario' | 'almacenero'): boolean {
    return this.currentUser()?.rol === role;
  }
}
