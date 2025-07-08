import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../../shared/services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // No mostrar notificaciones para ciertos códigos o URLs
      const shouldShowNotification = !shouldSkipErrorNotification(error, req.url);

      if (shouldShowNotification) {
        const errorMessage = getErrorMessage(error);
        notificationService.showError('Error en la operación', errorMessage);
      }

      // Re-lanzar el error para que los componentes puedan manejarlo si es necesario
      return throwError(() => error);
    })
  );
};

// Determinar si debemos omitir la notificación para este error
function shouldSkipErrorNotification(error: HttpErrorResponse, url: string): boolean {
  // Omitir notificaciones para:

  // 1. Errores de autenticación (401) - ya los maneja el AuthInterceptor
  if (error.status === 401) {
    return true;
  }

  // 2. URLs específicas que manejan sus propios errores
  const skipUrls = [
    '/auth',      // Login maneja sus propios errores
    '/dashboard', // Dashboard tiene su propio manejo de errores
  ];

  if (skipUrls.some(skipUrl => url.includes(skipUrl))) {
    return true;
  }

  // 3. Errores de conexión/red que ya son evidentes para el usuario
  if (error.status === 0) {
    return false; // Sí mostrar estos porque indican problemas de red
  }

  return false;
}

// Obtener un mensaje de error amigable
function getErrorMessage(error: HttpErrorResponse): string {
  // Si el backend envía un mensaje específico, usarlo
  if (error.error?.message) {
    return error.error.message;
  }

  // Mensajes por código de estado
  switch (error.status) {
    case 0:
      return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    case 400:
      return 'Los datos enviados no son válidos. Revisa la información e intenta nuevamente.';
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'El recurso solicitado no fue encontrado.';
    case 409:
      return 'Conflicto al procesar la solicitud. El recurso ya existe o está en uso.';
    case 422:
      return 'Los datos enviados no pudieron ser procesados. Verifica la información.';
    case 500:
      return 'Error interno del servidor. Intenta nuevamente en unos momentos.';
    case 502:
    case 503:
    case 504:
      return 'El servidor no está disponible temporalmente. Intenta más tarde.';
    default:
      return `Error inesperado (${error.status}). Contacta al administrador si persiste.`;
  }
}
