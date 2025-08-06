import { ChangeDetectionStrategy, Component, signal, Input, Output, EventEmitter, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { VentaPendiente } from '../../../../../types/dashboard.types';
import { Venta } from '../../../../../types/contract.types';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { VentaDetalleModalComponent } from '../../../ventas/components/venta-detalle-modal/venta-detalle-modal.component';
import { VentaService } from '../../../ventas/services/venta.service';
import { NotificationService } from '../../../../../shared/services/notification.service';

@Component({
  selector: 'app-cliente-deuda-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, FontAwesomeModule, VentaDetalleModalComponent],
  templateUrl: './cliente-deuda-modal.component.html',
  styleUrl: './cliente-deuda-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClienteDeudaModalComponent {
  private readonly ventaService = inject(VentaService);
  private readonly notificationService = inject(NotificationService);
  
  // FontAwesome icons
  faEye = faEye;
  
  @Input({ required: true }) clienteId!: number;
  @Input({ required: true }) deudas: VentaPendiente[] = [];
  @Input() visible = signal(false);
  @Output() close = new EventEmitter<void>();

  // Computed para compatibilidad con el modal
  isOpen = computed(() => this.visible());

  // Estado para el modal de detalle de venta
  ventaDetalleVisible = signal(false);
  selectedVenta = signal<Venta | null>(null);
  isLoadingVentaDetail = signal(false);

  closeModal(): void {
    this.close.emit();
  }

  showVentaDetail(ventaId: number): void {
    this.isLoadingVentaDetail.set(true);
    this.ventaService.getVentaById(ventaId).subscribe({
      next: (venta) => {
        this.selectedVenta.set(venta);
        this.ventaDetalleVisible.set(true);
        this.isLoadingVentaDetail.set(false);
      },
      error: (err) => {
        this.notificationService.showError('Error al cargar el detalle de la venta.');
        this.isLoadingVentaDetail.set(false);
      }
    });
  }

  closeVentaDetail(): void {
    this.ventaDetalleVisible.set(false);
    this.selectedVenta.set(null);
  }
}
