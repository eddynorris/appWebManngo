import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (notification of notificationService.getNotifications(); track notification.id) {
        <div
          class="toast"
          [class]="'toast-' + notification.type"
          [attr.role]="notification.type === 'error' ? 'alert' : 'status'"
        >
          <div class="toast-icon">
            @switch (notification.type) {
              @case ('success') { ✅ }
              @case ('error') { ❌ }
              @case ('warning') { ⚠️ }
              @case ('info') { ℹ️ }
              @default { 📢 }
            }
          </div>

          <div class="toast-content">
            <div class="toast-title">{{ notification.title }}</div>
            <div class="toast-message">{{ notification.message }}</div>

            @if (notification.actions && notification.actions.length > 0) {
              <div class="toast-actions">
                @for (action of notification.actions; track action.label) {
                  <button
                    type="button"
                    class="toast-action-btn"
                    (click)="action.action()"
                  >
                    {{ action.label }}
                  </button>
                }
              </div>
            }
          </div>

          <button
            type="button"
            class="toast-close"
            (click)="notificationService.removeNotification(notification.id)"
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  protected readonly notificationService = inject(NotificationService);
}
