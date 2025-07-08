import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationModalComponent {
  // --- Inputs ---
  title = input.required<string>();
  message = input.required<string>();
  confirmText = input('Confirmar');
  cancelText = input('Cancelar');

  // --- Outputs ---
  confirm = output<void>();
  cancel = output<void>();

  // --- Methods ---
  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
