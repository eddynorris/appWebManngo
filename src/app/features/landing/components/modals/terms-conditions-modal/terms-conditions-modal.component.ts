import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-terms-conditions-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './terms-conditions-modal.component.html',
  styleUrl: './terms-conditions-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsConditionsModalComponent {
  visible = input.required<boolean>();
  close = output<void>();

  handleClose(): void {
    this.close.emit();
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}