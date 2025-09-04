import { ChangeDetectionStrategy, Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { Cliente, Pagination } from '../../../../../types/contract.types';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig, ActionConfig } from '../../../../../shared/components/data-table/data-table.types';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { LoadingService } from '../../../../../shared/services/loading.service';
import { ConfirmationModalComponent } from '../../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { faEdit, faTrash, faPlus, faSearch, faDownload } from '@fortawesome/free-solid-svg-icons';
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
  private readonly loadingService = inject(LoadingService);

  // FontAwesome icons
  faPlus = faPlus;
  faSearch = faSearch;
  faEdit = faEdit;
  faTrash = faTrash;
  faDownload = faDownload;

  clientes = signal<Cliente[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = this.loadingService.isLoading;
  searchTerm = signal('');
  ciudadFilter = signal<string>(''); // Nuevo filtro de ciudad
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | undefined;
  isDeleteModalVisible = signal(false);
  clienteToDelete = signal<Cliente | null>(null);

  // Opciones del filtro de ciudad
  ciudadFilterOptions = [
    { value: '', label: 'Todas las ciudades' },
    { value: 'Abancay', label: 'Abancay' },
    { value: 'Andahuaylas', label: 'Andahuaylas' },
    { value: 'Lima', label: 'Lima' },
    { value: 'Chalhuanca', label: 'Chalhuanca' },
    { value: 'Cusco', label: 'Cusco' },
  ];

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
    this.loadingService.startLoading();
    // Pass search term and ciudad filter to API if exists
    const searchParam = this.searchTerm() || undefined;
    const ciudadParam = this.ciudadFilter() || undefined;
    this.clienteService.getClientes(page, per_page, searchParam, ciudadParam)
      .pipe(finalize(() => this.loadingService.stopLoading()))
      .subscribe({
        next: (response) => {
          this.clientes.set(response.data);
          this.pagination.set(response.pagination);
        },
        error: (err) => {
          this.notificationService.showError('Error al cargar los clientes.');
        }
      });
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  onCiudadFilterChange(value: string): void {
    this.ciudadFilter.set(value);
    this.loadClientes();
  }

  handleExportExcel(): void {
    const ciudadParam = this.ciudadFilter() || undefined;
    
    this.clienteService.exportarClientes(ciudadParam).subscribe({
      next: (blob) => {
        // Crear URL del blob y descargar archivo
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `clientes_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.notificationService.showSuccess('Archivo Excel descargado exitosamente.');
      },
      error: (err) => {
        this.notificationService.showError('Error al exportar los clientes.');
      }
    });
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
