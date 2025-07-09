import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Venta, Pago } from '../../../../../types/contract.types';
import { PagoService } from '../../../pagos/services/pago.service';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-venta-detalle-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './venta-detalle-modal.component.html',
  styleUrl: './venta-detalle-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VentaDetalleModalComponent implements OnInit {
  @Input({ required: true }) venta!: Venta;
  @Input() visible = signal(false);
  @Output() close = new EventEmitter<void>();

  private readonly pagoService = inject(PagoService);

  pagos = signal<Pago[]>([]);
  isLoadingPagos = signal(true);

  // Computed para compatibilidad con el modal
  isOpen = computed(() => this.visible());

  ngOnInit(): void {
    this.loadPagos();
  }

  loadPagos(): void {
    if (!this.venta?.id) return;

    this.isLoadingPagos.set(true);
    this.pagoService.getPagosByVentaId(this.venta.id).subscribe({
      next: (data) => {
        this.pagos.set(data);
        this.isLoadingPagos.set(false);
      },
      error: () => {
        // Podríamos añadir una notificación si es necesario
        this.isLoadingPagos.set(false);
      }
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}
