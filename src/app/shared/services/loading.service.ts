import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  // Contador de peticiones activas
  private readonly requestCount = signal(0);

  // Signal computado que determina si hay carga activa
  readonly isLoading = computed(() => this.requestCount() > 0);

  // Incrementar el contador al iniciar una petición
  startLoading(): void {
    this.requestCount.update(count => count + 1);
  }

  // Decrementar el contador al finalizar una petición
  stopLoading(): void {
    this.requestCount.update(count => Math.max(0, count - 1));
  }

  // Forzar parada de todas las cargas (útil para casos de error crítico)
  forceStopLoading(): void {
    this.requestCount.set(0);
  }

  // Obtener el número actual de peticiones activas (útil para debugging)
  getActiveRequestsCount(): number {
    return this.requestCount();
  }
}
