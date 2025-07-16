import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { Cliente, Pagination } from '../../../../../types/contract.types';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig, ActionConfig } from '../../../../../shared/components/data-table/data-table.types';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { ConfirmationModalComponent } from '../../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-clientes-list-page',
  standalone: true,
  imports: [RouterLink, FormsModule, DataTableComponent, ConfirmationModalComponent, PaginationComponent],
  templateUrl: './clientes-list-page.component.html',
  styleUrl: './clientes-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ClientesListPageComponent {
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  clientes = signal<Cliente[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(false);
  isDeleteModalVisible = signal(false);
  clienteToDelete = signal<Cliente | null>(null);

  columns: ColumnConfig<Cliente>[] = [
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'telefono', label: 'Teléfono', type: 'text' },
    { key: 'ciudad', label: 'Ciudad', type: 'text' },
    { key: 'saldo_pendiente', label: 'Saldo Pendiente', type: 'currency' },
    { key: 'actions', label: 'Acciones', type: 'actions' }
  ];

  actions: ActionConfig[] = [
    { icon: faEdit, label: '', action: 'edit' },
    { icon: faTrash, label: '', action: 'delete', danger: true },
  ];

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(page: number = 1, limit: number = 10): void {
    this.isLoading.set(true);
    this.clienteService.getClientes(page, limit).subscribe({
      next: (response) => {
        this.clientes.set(response.data);
        this.pagination.set(response.pagination);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.showError('Error al cargar los clientes.');
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    this.loadClientes(page);
  }

  handleTableAction(event: { action: string; item: Cliente }): void {
    if (event.action === 'edit') {
      this.router.navigate(['/admin/clientes/edit', event.item.id]);
    } else if (event.action === 'delete') {
      this.clienteToDelete.set(event.item);
      this.isDeleteModalVisible.set(true);
    }
  }

  handleDeleteConfirmation(): void {
    const cliente = this.clienteToDelete();
    if (!cliente || !cliente.id) return;

    this.clienteService.deleteCliente(cliente.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Cliente eliminado correctamente.');
        const currentPage = this.pagination()?.page || 1;
        this.loadClientes(currentPage);
      },
      error: (err) => {
        this.notificationService.showError('Error al eliminar el cliente.');
      }
    });
    this.closeDeleteModal();
  }

  closeDeleteModal(): void {
    this.isDeleteModalVisible.set(false);
    this.clienteToDelete.set(null);
  }
}
