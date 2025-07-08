import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { PedidoService } from '../../services/pedido.service';
import { Pedido, Pagination } from '../../../../../types/contract.types';

import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig, ActionConfig } from '../../../../../shared/components/data-table/data-table.types';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { ConfirmationModalComponent } from '../../../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-pedidos-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DataTableComponent,
    PaginationComponent,
    ConfirmationModalComponent,
  ],
  templateUrl: './pedidos-list-page.component.html',
  styleUrl: './pedidos-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PedidosListPageComponent implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  pedidos = signal<Pedido[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(false);
  isDeleteModalVisible = signal(false);
  pedidoToDelete = signal<Pedido | null>(null);

  columns: ColumnConfig<Pedido>[] = [
    { key: 'id', label: 'ID Pedido', type: 'text' },
    { key: 'fecha_creacion', label: 'F. Creación', type: 'date' },
    { key: 'fecha_entrega', label: 'F. Entrega', type: 'date' },
    { key: 'cliente.nombre', label: 'Cliente', type: 'text' },
    { key: 'estado', label: 'Estado', type: 'text' },
    { key: 'actions', label: 'Acciones', type: 'actions' },
  ];

  actions: ActionConfig[] = [
    { icon: '✏️', label: 'Editar', action: 'edit' },
    { icon: '🗑️', label: 'Eliminar', action: 'delete', danger: true },
  ];

  ngOnInit(): void {
    this.loadPedidos();
  }

  loadPedidos(page: number = 1, limit: number = 10): void {
    this.isLoading.set(true);
    this.pedidoService.getPedidos(page, limit).subscribe({
      next: (response) => {
        this.pedidos.set(response.data);
        this.pagination.set(response.pagination);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.showError('Error al cargar los pedidos.');
        console.error(err);
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.loadPedidos(page);
  }

  handleTableAction(event: { action: string; item: Pedido }): void {
    if (event.action === 'edit') {
      this.router.navigate(['/admin/pedidos/edit', event.item.id]);
    } else if (event.action === 'delete') {
      this.pedidoToDelete.set(event.item);
      this.isDeleteModalVisible.set(true);
    }
  }

  handleDeleteConfirmation(): void {
    const pedido = this.pedidoToDelete();
    if (!pedido || !pedido.id) return;

    this.pedidoService.deletePedido(pedido.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Pedido eliminado correctamente.');
        this.loadPedidos(this.pagination()?.page);
      },
      error: (err) => {
        this.notificationService.showError('Error al eliminar el pedido.');
        console.error(err);
      },
    });
    this.closeDeleteModal();
  }

  closeDeleteModal(): void {
    this.isDeleteModalVisible.set(false);
    this.pedidoToDelete.set(null);
  }
}
