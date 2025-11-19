import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../clientes/services/cliente.service';
import { ClienteProyeccion, ClienteProyeccionDetalle, Pagination } from '../../../../../types/contract.types';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig, ActionConfig } from '../../../../../shared/components/data-table/data-table.types';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { faSearch, faEye, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ProyeccionesPageDetailComponent } from '../proyecciones-page-detail.component/proyecciones-page-detail.component';

@Component({
  selector: 'app-proyecciones-page',
  imports: [FormsModule, DataTableComponent, PaginationComponent, FontAwesomeModule, ProyeccionesPageDetailComponent],
  templateUrl: './proyecciones-page.component.html',
  styleUrl: './proyecciones-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProyeccionesPageComponent implements OnInit, OnDestroy {
  private readonly clienteService = inject(ClienteService);
  private readonly notificationService = inject(NotificationService);

  // FontAwesome icons
  faSearch = faSearch;
  faEye = faEye;
  faFileExcel = faFileExcel;

  // State signals
  proyecciones = signal<ClienteProyeccion[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(true);
  isExporting = signal(false);
  searchTerm = signal('');
  ciudad = signal('');
  fechaDesde = signal<string>('');
  fechaHasta = signal<string>('');
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | undefined;

  // Modal state
  modalVisible = signal(false);
  selectedProyeccion = signal<ClienteProyeccionDetalle | null>(null);
  isLoadingDetail = signal(false);

  // Table configuration
  columns: ColumnConfig<ClienteProyeccion>[] = [
    { key: 'codigo', label: 'Código', type: 'text' },
    { key: 'nombre', label: 'Cliente', type: 'text' },
    { key: 'ciudad', label: 'Ciudad', type: 'text' },
    {
      key: 'telefono',
      label: 'Teléfono',
      type: 'text',
      customRender: (row: ClienteProyeccion) => row.telefono || '-'
    },
    { key: 'ultima_fecha_compra', label: 'Última Compra', type: 'date' },
    { key: 'proxima_fecha_estimada', label: 'Próxima Compra Estimada', type: 'date' },
    {
      key: 'estado_proyeccion',
      label: 'Estado',
      type: 'text',
      customRender: (row: ClienteProyeccion) => {
        const estados: Record<string, string> = {
          'proximo': '🟢 Próximo',
          'retrasado': '🔴 Retrasado',
          'normal': '🟡 Normal'
        };
        return estados[row.estado_proyeccion] || row.estado_proyeccion;
      }
    },
    { key: 'actions', label: 'Acciones', type: 'actions' }
  ];

  actions: ActionConfig[] = [
    {
      icon: faEye,
      label: 'Ver Detalle',
      action: 'view'
    }
  ];

  // Computed values
  filteredProyecciones = computed(() => {
    const search = this.searchTerm().toLowerCase();
    if (!search) return this.proyecciones();

    return this.proyecciones().filter(proyeccion =>
      proyeccion.nombre?.toLowerCase().includes(search)
    );
  });

  ngOnInit(): void {
    this.loadProyecciones();
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(value => {
      this.searchTerm.set(value);
      this.loadProyecciones();
    });
  }

  loadProyecciones(page: number = 1, per_page: number = 10): void {
    this.isLoading.set(true);
    const searchParam = this.searchTerm() || undefined;
    const ciudadParam = this.ciudad() || undefined;
    const desdeParam = this.fechaDesde() || undefined;
    const hastaParam = this.fechaHasta() || undefined;

    this.clienteService.getClientesProyecciones(
      page,
      per_page,
      searchParam,
      ciudadParam,
      undefined,
      desdeParam,
      hastaParam,
      undefined
    ).subscribe({
      next: (response) => {
        this.proyecciones.set(response.data);
        this.pagination.set(response.pagination);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.showError('Error al cargar las proyecciones de clientes.');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  onCiudadChange(value: string): void {
    this.ciudad.set(value);
    this.loadProyecciones();
  }

  onFechaDesdeChange(value: string): void {
    this.fechaDesde.set(value);
    this.loadProyecciones();
  }

  onFechaHastaChange(value: string): void {
    this.fechaHasta.set(value);
    this.loadProyecciones();
  }

  clearFilters(): void {
    this.ciudad.set('');
    this.fechaDesde.set('');
    this.fechaHasta.set('');
    this.loadProyecciones();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private addDays(base: Date, days: number): Date {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d;
  }

  setQuickRange(type: 'manana' | 'semana' | 'mes'): void {
    const today = new Date();
    if (type === 'manana') {
      const start = today;
      const end = this.addDays(today, 1);
      this.fechaDesde.set(this.formatDate(start));
      this.fechaHasta.set(this.formatDate(end));
    }
    if (type === 'semana') {
      const start = today;
      const end = this.addDays(today, 7);
      this.fechaDesde.set(this.formatDate(start));
      this.fechaHasta.set(this.formatDate(end));
    }
    if (type === 'mes') {
      const start = today;
      const end = this.addDays(today, 30);
      this.fechaDesde.set(this.formatDate(start));
      this.fechaHasta.set(this.formatDate(end));
    }
    this.loadProyecciones();
  }

  onPageChange(page: number): void {
    this.loadProyecciones(page);
  }

  onPerPageChange(perPage: number): void {
    this.loadProyecciones(1, perPage);
  }

  handleTableAction(event: { action: string; item: ClienteProyeccion }): void {
    if (event.action === 'view') {
      this.loadProyeccionDetalle(event.item.codigo);
    }
  }

  loadProyeccionDetalle(codigo: string): void {
    this.isLoadingDetail.set(true);
    this.modalVisible.set(true);

    this.clienteService.getClienteProyeccionDetalle(codigo).subscribe({
      next: (detalle) => {
        this.selectedProyeccion.set(detalle);
        this.isLoadingDetail.set(false);
      },
      error: (err) => {
        this.notificationService.showError('Error al cargar el detalle de la proyección.');
        this.isLoadingDetail.set(false);
        this.modalVisible.set(false);
      }
    });
  }

  closeModal(): void {
    this.modalVisible.set(false);
    this.selectedProyeccion.set(null);
  }

  handleExportExcel(): void {
    const searchParam = this.searchTerm() || undefined;
    const ciudadParam = this.ciudad() || undefined;
    const desdeParam = this.fechaDesde() || undefined;
    const hastaParam = this.fechaHasta() || undefined;

    this.isExporting.set(true);

    this.clienteService.exportarProyecciones(
      searchParam,
      ciudadParam,
      undefined,
      desdeParam,
      hastaParam,
      undefined
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `proyecciones-clientes-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.notificationService.showSuccess('Archivo Excel descargado exitosamente.');
        this.isExporting.set(false);
      },
      error: (err) => {
        console.error('Error al exportar:', err);
        this.notificationService.showError('Error al exportar el archivo Excel.');
        this.isExporting.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }
}
