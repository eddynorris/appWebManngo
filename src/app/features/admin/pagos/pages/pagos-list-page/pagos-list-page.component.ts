import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { PagoService } from '../../services/pago.service';
import { Pago, Pagination } from '../../../../../types/contract.types';

import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig, ActionConfig } from '../../../../../shared/components/data-table/data-table.types';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { ConfirmationModalComponent } from '../../../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-pagos-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DataTableComponent,
    PaginationComponent,
    ConfirmationModalComponent,
  ],
  templateUrl: './pagos-list-page.component.html',
  styleUrl: './pagos-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PagosListPageComponent implements OnInit {
  private readonly pagoService = inject(PagoService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  pagos = signal<Pago[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(false);
  isDeleteModalVisible = signal(false);
  pagoToDelete = signal<Pago | null>(null);

  columns: ColumnConfig<Pago>[] = [
    { key: 'id', label: 'ID Pago', type: 'text' },
    { key: 'fecha', label: 'Fecha', type: 'date' },
    { key: 'venta_id', label: 'ID Venta', type: 'text' },
    { key: 'monto', label: 'Monto', type: 'currency' },
    { key: 'metodo_pago', label: 'Método', type: 'text' },
    { key: 'usuario.username', label: 'Registrado por', type: 'text' },
    { key: 'actions', label: 'Acciones', type: 'actions' },
  ];

  actions: ActionConfig[] = [
    { icon: '✏️', label: 'Editar', action: 'edit' },
    { icon: '🗑️', label: 'Eliminar', action: 'delete', danger: true },
  ];

  ngOnInit(): void {
    this.loadPagos();
  }

  loadPagos(page: number = 1, limit: number = 10): void {
    this.isLoading.set(true);
    this.pagoService.getPagos(page, limit).subscribe({
      next: (response) => {
        this.pagos.set(response.data);
        this.pagination.set(response.pagination);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.showError('Error al cargar los pagos.');
        console.error(err);
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.loadPagos(page);
  }

  handleTableAction(event: { action: string; item: Pago }): void {
    if (event.action === 'edit') {
      this.router.navigate(['/admin/pagos/edit', event.item.id]);
    } else if (event.action === 'delete') {
      this.pagoToDelete.set(event.item);
      this.isDeleteModalVisible.set(true);
    }
  }

  handleDeleteConfirmation(): void {
    const pago = this.pagoToDelete();
    if (!pago || !pago.id) return;

    this.pagoService.deletePago(pago.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Pago eliminado correctamente.');
        this.loadPagos(this.pagination()?.page);
      },
      error: (err) => {
        this.notificationService.showError('Error al eliminar el pago.');
        console.error(err);
      },
    });
    this.closeDeleteModal();
  }

  closeDeleteModal(): void {
    this.isDeleteModalVisible.set(false);
    this.pagoToDelete.set(null);
  }
}
