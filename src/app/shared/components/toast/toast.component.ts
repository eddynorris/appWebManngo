import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faExclamationTriangle, faInfoCircle, faTimes, faBullhorn } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [FontAwesomeModule],
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
              @case ('success') { <fa-icon [icon]="faCheckCircle"></fa-icon> }
              @case ('error') { <fa-icon [icon]="faExclamationTriangle"></fa-icon> }
              @case ('warning') { <fa-icon [icon]="faExclamationTriangle"></fa-icon> }
              @case ('info') { <fa-icon [icon]="faInfoCircle"></fa-icon> }
              @default { <fa-icon [icon]="faBullhorn"></fa-icon> }
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
            <fa-icon [icon]="faTimes"></fa-icon>
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

  // FontAwesome icons
  faCheckCircle = faCheckCircle;
  faExclamationTriangle = faExclamationTriangle;
  faInfoCircle = faInfoCircle;
  faTimes = faTimes;
  faBullhorn = faBullhorn;
}
