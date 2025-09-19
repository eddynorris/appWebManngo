import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { VentaService } from '../../services/venta.service';
import { Venta, Pagination } from '../../../../../types/contract.types';

import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig, ActionConfig } from '../../../../../shared/components/data-table/data-table.types';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { ConfirmationModalComponent } from '../../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { LoadingService } from '../../../../../shared/services/loading.service';
import { VentaDetalleModalComponent } from '../../components/venta-detalle-modal/venta-detalle-modal.component';
import { TableFiltersComponent, FilterConfig, FilterValues } from '../../../../../shared/components/table-filters/table-filters.component';
import { faEdit, faEye, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-ventas-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    DataTableComponent,
    PaginationComponent,
    VentaDetalleModalComponent,
    TableFiltersComponent,
    FontAwesomeModule,
    ConfirmationModalComponent,
  ],
  templateUrl: './ventas-list-page.component.html',
  styleUrl: './ventas-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VentasListPageComponent implements OnInit {
  private readonly ventaService = inject(VentaService);
  private readonly router = inject(Router);
  private readonly loadingService = inject(LoadingService);
  private readonly fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  // Configuración de filtros para el componente compartido
  filterConfigs = computed<FilterConfig[]>(() => [
    {
      key: 'cliente_id',
      label: 'Cliente',
      type: 'client-select',
      placeholder: 'Buscar cliente...',
      colSpan: 2
    },
    {
      key: 'almacen_id',
      label: 'Almacén',
      type: 'select',
      placeholder: 'Todos los almacenes',
      options: this.almacenes().map(a => ({ value: a.id, label: a.nombre }))
    },
    {
      key: 'vendedor_id',
      label: 'Vendedor',
      type: 'select',
      placeholder: 'Todos los vendedores',
      options: this.vendedores().map(v => ({ value: v.id, label: v.username }))
    },
    {
      key: 'estado_pago',
      label: 'Estado de Pago',
      type: 'select',
      placeholder: 'Todos los estados',
      options: this.estadosPago()
    },
    {
      key: 'fecha_inicio',
      label: 'Fecha Inicio',
      type: 'date'
    },
    {
      key: 'fecha_fin',
      label: 'Fecha Fin',
      type: 'date'
    }
  ]);

  // Valores actuales de los filtros
  currentFilterValues = signal<FilterValues>({});

  // FontAwesome icons
  faPlus = faPlus;

  ventas = signal<Venta[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = this.loadingService.isLoading;
  isModalVisible = signal(false);
  selectedVenta = signal<Venta | null>(null);

  // Signals para modal de eliminación
  isDeleteModalVisible = signal(false);
  ventaToDelete = signal<Venta | null>(null);

  // Signals para datos de filtros
  clientes = signal<{ id: number; nombre: string }[]>([]);
  almacenes = signal<{ id: number; nombre: string }[]>([]);
  vendedores = signal<{ id: number; username: string }[]>([]);
  estadosPago = signal<{ value: string; label: string }[]>([]);



  columns: ColumnConfig<Venta>[] = [
    { key: 'id', label: 'ID Venta', type: 'text' },
    { key: 'fecha', label: 'Fecha', type: 'date' },
    { key: 'cliente.nombre', label: 'Cliente', type: 'text' },
    { key: 'vendedor.username', label: 'Vendedor', type: 'text' },
    { key: 'total', label: 'Total', type: 'currency' },
    { key: 'estado_pago', label: 'Estado Pago', type: 'text' },
    { key: 'actions', label: 'Acciones', type: 'actions' }
  ];

  actions: ActionConfig[] = [
    { icon: faEye, label: '', action: 'view' },
    { icon: faEdit, label: '', action: 'edit' },
    { icon: faTrash, label: '', action: 'delete' },
  ];

  ngOnInit(): void {
    this.loadVentas();
    this.loadFiltrosData();
  }

  // Manejar cambios en los filtros del componente compartido
  onFiltersChange(filters: FilterValues): void {
    this.currentFilterValues.set(filters);
  }

  // Manejar búsqueda desde el componente compartido
  onSearch(filters: FilterValues): void {
    this.currentFilterValues.set(filters);
    const cleanFilters = this.processFilters(filters);
    this.loadVentas(1, 10, cleanFilters);
  }

  // Manejar exportación desde el componente compartido
  onExport(filters: FilterValues): void {
    this.currentFilterValues.set(filters);
    const cleanFilters = this.processFilters(filters);
    this.exportWithFilters(cleanFilters);
  }

  // Manejar limpieza de filtros
  onClearFilters(): void {
    this.currentFilterValues.set({});
    this.loadVentas(1, 10, {});
  }

  // Procesar filtros para el backend
  private processFilters(filters: FilterValues): any {
    const cleanFilters: any = {};
    
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        cleanFilters[key] = filters[key];
      }
    });
    
    return cleanFilters;
  }

  loadFiltrosData(): void {
    this.ventaService.getFiltrosData().subscribe({
      next: (data) => {
        this.clientes.set(data.clientes);
        this.almacenes.set(data.almacenes);
        this.vendedores.set(data.vendedores);
        // Manejar estados_pago como array de strings o objetos
        const estados = Array.isArray(data.estados_pago) ? data.estados_pago : [];
        this.estadosPago.set(estados);
      },
      error: (err) => {
        console.error('Error al cargar datos de filtros:', err);
        this.notificationService.showError('Error al cargar datos de filtros.');
      }
    });
  }

  loadVentas(page: number = 1, per_page: number = 10, filters?: any): void {
    this.loadingService.startLoading();
    this.ventaService.getVentas(page, per_page, filters)
      .pipe(finalize(() => this.loadingService.stopLoading()))
      .subscribe({
        next: (response) => {
          this.ventas.set(response.data);
          this.pagination.set(response.pagination);
        },
        error: (err) => {
          this.notificationService.showError('Error al cargar las ventas.');
        }
      });
  }

  onPageChange(page: number): void {
    const filters = this.processFilters(this.currentFilterValues());
    this.loadVentas(page, 10, filters);
  }

  onPerPageChange(perPage: number): void {
    const filters = this.processFilters(this.currentFilterValues());
    this.loadVentas(1, perPage, filters); // Reset to page 1 when changing per page
  }

  handleTableAction(event: { action: string; item: Venta }): void {
    const { action, item } = event;
    if (action === 'edit') {
      this.router.navigate(['/admin/ventas/edit', item.id]);
    } else if (action === 'view') {
      this.selectedVenta.set(item);
      this.isModalVisible.set(true);
    } else if (action === 'delete') {
      this.ventaToDelete.set(item);
      this.isDeleteModalVisible.set(true);
    }
  }

  handleCloseModal(): void {
    this.isModalVisible.set(false);
    this.selectedVenta.set(null);
  }

  handleDeleteConfirmation(): void {
    const venta = this.ventaToDelete();
    if (!venta || !venta.id) return;

    this.ventaService.deleteVenta(venta.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Venta eliminada correctamente.');
        const currentPage = this.pagination()?.page || 1;
        this.loadVentas(currentPage);
      },
      error: (err) => {
        this.notificationService.showError('Error al eliminar la venta.');
      }
    });
    this.closeDeleteModal();
  }

  closeDeleteModal(): void {
    this.isDeleteModalVisible.set(false);
    this.ventaToDelete.set(null);
  }



  // Exportar con filtros específicos
  private exportWithFilters(filters: any): void {
    this.ventaService.exportarVentas(filters).subscribe({
      next: (blob) => {
        // Crear URL del blob y descargar archivo
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ventas_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.notificationService.showSuccess('Excel exportado exitosamente');
      },
      error: (error) => {
        console.error('Error al exportar Excel:', error);
        this.notificationService.showError('Error al exportar Excel');
      }
    });
  }
}
