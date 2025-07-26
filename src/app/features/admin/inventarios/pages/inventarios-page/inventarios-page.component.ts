import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

import { InventarioService } from '../../services/inventario.service';
import { AlmacenService } from '../../../almacenes/services/almacen.service';
import { Inventario, Pagination, Almacen, InventariosResponse } from '../../../../../types/contract.types';

import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig, ActionConfig } from '../../../../../shared/components/data-table/data-table.types';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { LoadingService } from '../../../../../shared/services/loading.service';
import { InventoryAdjustmentModalComponent } from '../../components/inventory-adjustment-modal/inventory-adjustment-modal.component';
import { ConfirmationModalComponent } from '../../../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-inventarios-page',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    PaginationComponent,
    FontAwesomeModule,
    InventoryAdjustmentModalComponent,
    ConfirmationModalComponent,
  ],
  templateUrl: './inventarios-page.component.html',
  styleUrl: './inventarios-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InventariosPageComponent implements OnInit {
  private readonly inventarioService = inject(InventarioService);
  private readonly almacenService = inject(AlmacenService);
  private readonly notificationService = inject(NotificationService);
  public readonly loadingService = inject(LoadingService);

  // FontAwesome icons
  faEdit = faEdit;

  // State
  inventario = signal<Inventario[]>([]);
  pagination = signal<Pagination | null>(null);
  almacenes = signal<Almacen[]>([]);
  selectedAlmacen = signal<number | undefined>(undefined);

  // Modal state
  isAdjustmentModalOpen = signal(false);
  selectedInventario = signal<Inventario | null>(null);
  isConfirmationModalOpen = signal(false);
  pendingAdjustment = signal<{
    inventario: Inventario;
    adjustment: { cantidad: number; motivo: string; lote_id?: number };
  } | null>(null);

  columns: ColumnConfig<Inventario>[] = [
    { key: 'almacen.nombre', label: 'Almacén', type: 'text' },
    { key: 'presentacion.nombre', label: 'Producto', type: 'text' },
    { key: 'presentacion.capacidad_kg', label: 'Capacidad (kg)', type: 'text' },
    { key: 'cantidad', label: 'Cantidad Actual', type: 'text' },
    { key: 'stock_minimo', label: 'Stock Mínimo', type: 'text' },
    { key: 'actions', label: 'Acciones', type: 'actions' }
  ];

  actions: ActionConfig[] = [
    { icon: faEdit, label: 'Ajustar Inventario', action: 'adjust' }
  ];

  ngOnInit(): void {
    this.loadAlmacenes();
    this.loadInventario();
  }

  loadAlmacenes(): void {
    this.almacenService.getAlmacenes().pipe(
      map((response: any) => {
        // Comprobar si la respuesta es un objeto con una propiedad 'data' (paginada)
        if (response && Array.isArray(response.data)) {
          return response.data;
        }
        // Si no, asumir que es un array plano
        return response;
      })
    ).subscribe({
      next: (data: Almacen[]) => {
        if (Array.isArray(data)) {
          this.almacenes.set(data);
        } else {
          this.notificationService.showError('Error: formato de datos de almacenes incorrecto.');
        }
      },
      error: (err: any) => {
        this.notificationService.showError('Error al cargar los almacenes.');
      }
    });
  }

  loadInventario(page: number = 1): void {
    const almacenId = this.selectedAlmacen();
    this.inventarioService.getInventarios(page, 10, almacenId).subscribe({
      next: (response: InventariosResponse) => {
        this.inventario.set(response.data);
        this.pagination.set(response.pagination);
      },
      error: (err: any) => {
        this.notificationService.showError('Error al cargar el inventario.');
      },
    });
  }

  onAlmacenChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const almacenId = target.value ? Number(target.value) : undefined;
    this.selectedAlmacen.set(almacenId);
    this.loadInventario();
  }

  onPageChange(page: number): void {
    this.loadInventario(page);
  }

  onPerPageChange(perPage: number): void {
    this.loadInventario(1); // Reset to page 1 when changing per page
  }

  // Handle table actions
  onTableAction(event: { action: string; item: Inventario }): void {
    if (event.action === 'adjust') {
      this.openAdjustmentModal(event.item);
    }
  }

  // Modal methods
  openAdjustmentModal(inventario: Inventario): void {
    this.selectedInventario.set(inventario);
    this.isAdjustmentModalOpen.set(true);
  }

  closeAdjustmentModal(): void {
    this.isAdjustmentModalOpen.set(false);
    this.selectedInventario.set(null);
  }

  onAdjustmentSave(adjustment: { cantidad: number; motivo: string; lote_id?: number }): void {
    const inventario = this.selectedInventario();
    if (!inventario) return;

    this.pendingAdjustment.set({ inventario, adjustment });
    this.closeAdjustmentModal();
    this.isConfirmationModalOpen.set(true);
  }

  closeConfirmationModal(): void {
    this.isConfirmationModalOpen.set(false);
    this.pendingAdjustment.set(null);
  }

  confirmAdjustment(): void {
    const pending = this.pendingAdjustment();
    if (!pending) return;

    const { inventario, adjustment } = pending;

    this.inventarioService.updateInventario(inventario.id!, adjustment).subscribe({
      next: (updatedInventario) => {
        // Update the inventario in the list
        const currentInventarios = this.inventario();
        const index = currentInventarios.findIndex(inv => inv.id === inventario.id);
        if (index !== -1) {
          const updatedInventarios = [...currentInventarios];
          updatedInventarios[index] = updatedInventario;
          this.inventario.set(updatedInventarios);
        }

        this.notificationService.showSuccess('Inventario actualizado correctamente');
        this.closeConfirmationModal();
      },
      error: () => {
        this.notificationService.showError('Error al actualizar el inventario');
        this.closeConfirmationModal();
      }
    });
  }

  getConfirmationMessage(): string {
    const pending = this.pendingAdjustment();
    if (!pending) return '';

    const { inventario, adjustment } = pending;
    const producto = inventario.presentacion?.nombre || 'producto';
    const currentStock = inventario.cantidad || 0;
    const newStock = adjustment.cantidad;
    const difference = newStock - currentStock;
    const action = difference > 0 ? 'agregar' : 'quitar';
    const absoluteDifference = Math.abs(difference);

    return `¿Está seguro que desea ${action} ${absoluteDifference} unidades de ${producto}? 
            El stock pasará de ${currentStock} a ${newStock} unidades.
            
            Motivo: ${adjustment.motivo}`;
  }
}
