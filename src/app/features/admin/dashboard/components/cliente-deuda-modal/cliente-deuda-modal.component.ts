import { ChangeDetectionStrategy, Component, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentaPendiente } from '../../../../../types/dashboard.types';

@Component({
  selector: 'app-cliente-deuda-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cliente-deuda-modal.component.html',
  styleUrl: './cliente-deuda-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClienteDeudaModalComponent {
  @Input({ required: true }) clienteId!: number;
  @Input({ required: true }) deudas: VentaPendiente[] = [];
  @Output() close = new EventEmitter<void>();

  // No longer needs its own loading/error state for data fetching
  // The parent component (dashboard) will handle it.

  closeModal(): void {
    this.close.emit();
  }
}
