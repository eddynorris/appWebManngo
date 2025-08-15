import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClienteService } from '../../../clientes/services/cliente.service';
import { ClienteProyeccion, Pagination } from '../../../../../types/contract.types';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig, ActionConfig } from '../../../../../shared/components/data-table/data-table.types';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { faSearch, faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-proyecciones-page',
  imports: [FormsModule, DataTableComponent, PaginationComponent, FontAwesomeModule],
  templateUrl: './proyecciones-page.component.html',
  styleUrl: './proyecciones-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProyeccionesPageComponent implements OnInit, OnDestroy {
  private readonly clienteService = inject(ClienteService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  // FontAwesome icons
  faSearch = faSearch;
  faEye = faEye;



  proyecciones = signal<ClienteProyeccion[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(false);
  searchTerm = signal('');
  dateFilter = signal<string>(''); // Nuevo filtro de fecha
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | undefined;

  // Opciones del filtro de fecha
  dateFilterOptions = [
    { value: '', label: 'Todas las fechas' },
    { value: 'manana', label: 'Mañana' },
    { value: 'semana', label: 'Esta Semana' },
    { value: 'week', label: 'Este Mes' }
  ];

  columns: ColumnConfig<ClienteProyeccion>[] = [
    { key: 'nombre', label: 'Cliente', type: 'text' },
    { key: 'telefono', label: 'Teléfono', type: 'text' },
    { key: 'ultima_fecha_compra', label: 'Última Compra', type: 'date' },
    { key: 'frecuencia_compra_dias', label: 'Frecuencia (días)', type: 'text' },
    { key: 'proxima_compra_estimada', label: 'Próxima Compra', type: 'date' },
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
    const dateParam = this.dateFilter() || undefined;
    
    this.clienteService.getClientesProyecciones(page, per_page, searchParam, dateParam).subscribe({
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

  onDateFilterChange(value: string): void {
    this.dateFilter.set(value);
    this.loadProyecciones(); // Recargar con el nuevo filtro
  }

  onPageChange(page: number): void {
    this.loadProyecciones(page);
  }

  onPerPageChange(perPage: number): void {
    this.loadProyecciones(1, perPage);
  }

  handleTableAction(event: { action: string; item: ClienteProyeccion }): void {
    if (event.action === 'view') {
      this.router.navigate(['/admin/proyecciones', event.item.id]);
    }
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }
}
