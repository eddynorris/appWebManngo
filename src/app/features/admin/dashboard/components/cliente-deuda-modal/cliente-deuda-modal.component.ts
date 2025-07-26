import { ChangeDetectionStrategy, Component, signal, Input, Output, EventEmitter, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { VentaPendiente } from '../../../../../types/dashboard.types';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-cliente-deuda-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, FontAwesomeModule],
  templateUrl: './cliente-deuda-modal.component.html',
  styleUrl: './cliente-deuda-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClienteDeudaModalComponent {
  private readonly router = inject(Router);
  
  // FontAwesome icons
  faEye = faEye;
  
  @Input({ required: true }) clienteId!: number;
  @Input({ required: true }) deudas: VentaPendiente[] = [];
  @Input() visible = signal(false);
  @Output() close = new EventEmitter<void>();

  // Computed para compatibilidad con el modal
  isOpen = computed(() => this.visible());

  closeModal(): void {
    this.close.emit();
  }

  navigateToVentaDetail(ventaId: number): void {
    // Cerrar el modal antes de navegar
    this.closeModal();
    // Navegar al detalle de la venta
    this.router.navigate(['/admin/ventas', ventaId]);
  }
}
