import { ChangeDetectionStrategy, Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { Cliente, Pagination } from '../../../../../types/contract.types';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig, ActionConfig } from '../../../../../shared/components/data-table/data-table.types';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { ConfirmationModalComponent } from '../../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { faEdit, faTrash, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-clientes-list-page',
  standalone: true,
  imports: [RouterLink, FormsModule, DataTableComponent, ConfirmationModalComponent, PaginationComponent, FontAwesomeModule],
  templateUrl: './clientes-list-page.component.html',
  styleUrl: './clientes-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ClientesListPageComponent implements OnDestroy {
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  // FontAwesome icons
  faPlus = faPlus;
  faSearch = faSearch;
  faEdit = faEdit;
  faTrash = faTrash;

  clientes = signal<Cliente[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(false);
  searchTerm = signal('');
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | undefined;
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

  // Computed values
  filteredClientes = computed(() => {
    const search = this.searchTerm().toLowerCase();
    if (!search) return this.clientes();

    return this.clientes().filter(cliente =>
      cliente.nombre?.toLowerCase().includes(search)
    );
  });

  ngOnInit(): void {
    this.loadClientes();
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(value => {
      this.searchTerm.set(value);
      this.loadClientes();
    });
  }

  loadClientes(page: number = 1, per_page: number = 10): void {
    this.isLoading.set(true);
    // Pass search term to API if exists
    const searchParam = this.searchTerm() || undefined;
    this.clienteService.getClientes(page, per_page, searchParam).subscribe({
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

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  onPageChange(page: number): void {
    this.loadClientes(page);
  }

  onPerPageChange(perPage: number): void {
    this.loadClientes(1, perPage); // Reset to page 1 when changing per page
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

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }
}
