import { Component, Input, Output, EventEmitter, Signal, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faCalendarAlt, faChartLine, faDollarSign, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { ClienteProyeccionDetalle } from '../../../../../types/contract.types';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig } from '../../../../../shared/components/data-table/data-table.types';

@Component({
  selector: 'app-proyecciones-page-detail',
  imports: [CommonModule, FontAwesomeModule, DataTableComponent],
  templateUrl: './proyecciones-page-detail.component.html',
  styleUrl: './proyecciones-page-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProyeccionesPageDetailComponent {
  @Input() proyeccionDetalle: ClienteProyeccionDetalle | null = null;
  @Input() isLoading: boolean = false;
  @Input() visible: boolean = false;
  @Output() close = new EventEmitter<void>();

  // FontAwesome icons
  faTimes = faTimes;
  faCalendarAlt = faCalendarAlt;
  faChartLine = faChartLine;
  faDollarSign = faDollarSign;
  faShoppingCart = faShoppingCart;

  // Configuración de columnas para la tabla de ventas
  readonly ventasColumns: ColumnConfig<any>[] = [
    {
      key: 'id',
      label: 'ID Venta',
      type: 'text',
      customRender: (venta: any) => `#${venta.id}`
    },
    {
      key: 'fecha',
      label: 'Fecha',
      type: 'date'
    },
    {
      key: 'estado_pago',
      label: 'Estado de Pago',
      type: 'text'
    },
    {
      key: 'total',
      label: 'Total',
      type: 'currency'
    }
  ];

  closeModal(): void {
    this.close.emit();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  }

  getProductoLabel(producto: any): string {
    if (typeof producto === 'string') {
      return producto;
    }
    return producto?.nombre || producto?.presentacion || producto?.producto || 'Producto desconocido';
  }

  onOverlayClick(): void {
    this.closeModal();
  }

  onContentClick(event: Event): void {
    event.stopPropagation();
  }
}
