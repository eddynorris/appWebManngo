import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';

import { PedidoService } from '../../services/pedido.service';
import { Pedido, Pagination } from '../../../../../types/contract.types';

import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig, ActionConfig } from '../../../../../shared/components/data-table/data-table.types';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { LoadingService } from '../../../../../shared/services/loading.service';
import { ConfirmationModalComponent } from '../../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-pedidos-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
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
  private readonly loadingService = inject(LoadingService);
  private readonly fb = inject(FormBuilder);

  pedidos = signal<Pedido[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = this.loadingService.isLoading;
  isDeleteModalVisible = signal(false);
  pedidoToDelete = signal<Pedido | null>(null);
  filterForm: FormGroup;

  columns: ColumnConfig<Pedido>[] = [
    { key: 'id', label: 'ID Pedido', type: 'text' },
    { key: 'fecha_creacion', label: 'F. Creación', type: 'date' },
    { key: 'fecha_entrega', label: 'F. Entrega', type: 'date' },
    { key: 'cliente.nombre', label: 'Cliente', type: 'text' },
    { key: 'estado', label: 'Estado', type: 'text' },
    { key: 'actions', label: 'Acciones', type: 'actions' },
  ];

  actions: ActionConfig[] = [
    { icon: faEdit, label: '', action: 'edit' },
    { icon: faTrash, label: '', action: 'delete', danger: true },
  ];

  constructor() {
    this.filterForm = this.fb.group({
      fecha_inicio: [''],
      fecha_fin: [''],
    });
  }

  ngOnInit(): void {
    this.loadPedidos();
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.loadPedidos();
      });
  }

  loadPedidos(page: number = 1, per_page: number = 10): void {
    this.loadingService.startLoading();
    const filters = this.filterForm.value;
    this.pedidoService.getPedidos(page, per_page, filters)
      .pipe(finalize(() => this.loadingService.stopLoading()))
      .subscribe({
        next: (response) => {
          this.pedidos.set(response.data);
          this.pagination.set(response.pagination);
        },
        error: (err) => {
          this.notificationService.showError('Error al cargar los pedidos.');
        },
      });
  }

  onPageChange(page: number): void {
    this.loadPedidos(page);
  }

  onPerPageChange(perPage: number): void {
    this.loadPedidos(1, perPage); // Reset to page 1 when changing per page
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
      },
    });
    this.closeDeleteModal();
  }

  closeDeleteModal(): void {
    this.isDeleteModalVisible.set(false);
    this.pedidoToDelete.set(null);
  }
}
