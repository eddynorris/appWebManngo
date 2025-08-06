import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { GastoService } from '../../services/gasto.service';
import { Gasto, Pagination } from '../../../../../types/contract.types';

import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig, ActionConfig } from '../../../../../shared/components/data-table/data-table.types';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { ConfirmationModalComponent } from '../../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-gastos-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DataTableComponent,
    PaginationComponent,
    ConfirmationModalComponent,
  ],
  templateUrl: './gastos-list-page.component.html',
  styleUrl: './gastos-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GastosListPageComponent implements OnInit {
  private readonly gastoService = inject(GastoService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  gastos = signal<Gasto[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(false);
  isDeleteModalVisible = signal(false);
  gastoToDelete = signal<Gasto | null>(null);

  columns: ColumnConfig<Gasto>[] = [
    { key: 'fecha', label: 'Fecha', type: 'date' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    { key: 'categoria', label: 'Categoría', type: 'text' },
    { key: 'monto', label: 'Monto', type: 'currency' },
    { key: 'almacen.nombre', label: 'Almacén', type: 'text' },
    { key: 'usuario.username', label: 'Registrado por', type: 'text' },
    { key: 'actions', label: 'Acciones', type: 'actions' },
  ];

  actions: ActionConfig[] = [
    { icon: faEdit, label: '', action: 'edit' },
    { icon: faTrash, label: '', action: 'delete', danger: true },
  ];

  ngOnInit(): void {
    this.loadGastos();
  }

  loadGastos(page: number = 1, per_page: number = 10): void {
    this.isLoading.set(true);
    this.gastoService.getGastos(page, per_page).subscribe({
      next: (response) => {
        this.gastos.set(response.data);
        this.pagination.set(response.pagination);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.showError('Error al cargar los gastos.');
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.loadGastos(page);
  }

  onPerPageChange(perPage: number): void {
    this.loadGastos(1, perPage); // Reset to page 1 when changing per page
  }

  handleTableAction(event: { action: string; item: Gasto }): void {
    if (event.action === 'edit') {
      this.router.navigate(['/admin/gastos/edit', event.item.id]);
    } else if (event.action === 'delete') {
      this.gastoToDelete.set(event.item);
      this.isDeleteModalVisible.set(true);
    }
  }

  handleDeleteConfirmation(): void {
    const gasto = this.gastoToDelete();
    if (!gasto || !gasto.id) return;

    this.gastoService.deleteGasto(gasto.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Gasto eliminado correctamente.');
        this.loadGastos(this.pagination()?.page);
      },
      error: (err) => {
        this.notificationService.showError('Error al eliminar el gasto.');
      },
    });
    this.closeDeleteModal();
  }

  closeDeleteModal(): void {
    this.isDeleteModalVisible.set(false);
    this.gastoToDelete.set(null);
  }
}
