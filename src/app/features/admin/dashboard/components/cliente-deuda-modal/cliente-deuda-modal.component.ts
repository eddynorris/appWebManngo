import { ChangeDetectionStrategy, Component, signal, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentaPendiente } from '../../../../../types/dashboard.types';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-cliente-deuda-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './cliente-deuda-modal.component.html',
  styleUrl: './cliente-deuda-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClienteDeudaModalComponent {
  @Input({ required: true }) clienteId!: number;
  @Input({ required: true }) deudas: VentaPendiente[] = [];
  @Input() visible = signal(false);
  @Output() close = new EventEmitter<void>();

  // Computed para compatibilidad con el modal
  isOpen = computed(() => this.visible());

  closeModal(): void {
    this.close.emit();
  }
}
