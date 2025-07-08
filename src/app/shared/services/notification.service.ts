import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number; // en milisegundos, 0 = no auto-dismiss
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly notifications = signal<Notification[]>([]);

  // Getter para las notificaciones actuales
  getNotifications = this.notifications.asReadonly();

  // Mostrar notificación de éxito
  showSuccess(title: string, message?: string, duration = 4000): void {
    this.addNotification({
      type: 'success',
      title,
      message: message || '',
      duration,
    });
  }

  // Mostrar notificación de error
  showError(title: string, message?: string, duration = 6000): void {
    this.addNotification({
      type: 'error',
      title,
      message,
      duration,
    });
  }

  // Mostrar notificación de advertencia
  showWarning(title: string, message?: string, duration = 5000): void {
    this.addNotification({
      type: 'warning',
      title,
      message: message || '',
      duration,
    });
  }

  // Mostrar notificación informativa
  showInfo(title: string, message?: string, duration = 4000): void {
    this.addNotification({
      type: 'info',
      title,
      message: message || '',
      duration,
    });
  }

  // Método genérico para agregar notificaciones
  private addNotification(notification: Omit<Notification, 'id'>): void {
    const id = this.generateId();
    const newNotification: Notification = { ...notification, id };

    this.notifications.update(notifications => [...notifications, newNotification]);

    // Auto-dismiss si tiene duración
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(id);
      }, newNotification.duration);
    }
  }

  // Remover una notificación específica
  removeNotification(id: string): void {
    this.notifications.update(notifications =>
      notifications.filter(notification => notification.id !== id)
    );
  }

  // Limpiar todas las notificaciones
  clearAll(): void {
    this.notifications.set([]);
  }

  // Generar ID único para las notificaciones
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
