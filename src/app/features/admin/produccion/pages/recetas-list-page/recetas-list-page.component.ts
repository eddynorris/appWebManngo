import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { RecetaService, Receta } from '../../services/receta.service';
import { Pagination, PresentacionProducto } from '../../../../../types/contract.types';

import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig, ActionConfig } from '../../../../../shared/components/data-table/data-table.types';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { ConfirmationModalComponent } from '../../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { faEdit, faTrash, faPlus, faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PresentacionService } from '../../../presentaciones/services/presentacion.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-recetas-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    DataTableComponent,
    PaginationComponent,
    ConfirmationModalComponent,
    FontAwesomeModule,
  ],
  templateUrl: './recetas-list-page.component.html',
  styleUrl: './recetas-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RecetasListPageComponent implements OnInit {
  private readonly recetaService = inject(RecetaService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly presentacionService = inject(PresentacionService);
  private readonly fb = inject(FormBuilder);

  // FontAwesome icons
  faPlus = faPlus;
  faDownload = faDownload;

  // Signals
  recetas = signal<Receta[]>([]);
  presentaciones = signal<PresentacionProducto[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(false);
  isDeleteModalVisible = signal(false);
  recetaToDelete = signal<Receta | null>(null);

  // Formulario de filtros
  filterForm: FormGroup;

  columns: ColumnConfig<Receta>[] = [
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    { key: 'created_at', label: 'Fecha Creación', type: 'date' },
    { key: 'actions', label: 'Acciones', type: 'actions' },
  ];

  actions: ActionConfig[] = [
    { icon: faEdit, label: '', action: 'edit' },
    { icon: faTrash, label: '', action: 'delete', danger: true },
  ];

  constructor() {
    this.filterForm = this.fb.group({
      search: [''],
      activo: ['']
    });
  }

  ngOnInit(): void {
    this.loadRecetas();
    this.setupFilterSubscription();
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.loadRecetas(1); // Reset to page 1 when filters change
    });
  }

  loadRecetas(page: number = 1, per_page: number = 10): void {
    this.isLoading.set(true);
    
    const filters: any = {};
    const searchValue = this.filterForm.get('search')?.value;
    const activoValue = this.filterForm.get('activo')?.value;
    
    if (searchValue) {
      filters.search = searchValue;
    }
    
    if (activoValue !== '') {
      filters.activo = activoValue === 'true';
    }

    const recetas$ = this.recetaService.getRecetas(page, per_page, filters);
    const presentaciones$ = this.presentacionService.getPresentaciones();

    forkJoin([recetas$, presentaciones$]).subscribe({
      next: ([recetasResponse, presentacionesResponse]) => {
        this.recetas.set(recetasResponse?.data || []);
        this.pagination.set(recetasResponse?.pagination || null);
        this.presentaciones.set(presentacionesResponse?.data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.showError('Error al cargar los datos.');
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.loadRecetas(page);
  }

  onPerPageChange(perPage: number): void {
    this.loadRecetas(1, perPage); // Reset to page 1 when changing per page
  }

  handleTableAction(event: { action: string; item: Receta }): void {
    if (event.action === 'edit') {
      this.router.navigate(['/admin/produccion/recetas/edit', event.item.id]);
    } else if (event.action === 'delete') {
      this.recetaToDelete.set(event.item);
      this.isDeleteModalVisible.set(true);
    }
  }

  handleDeleteConfirmation(): void {
    const receta = this.recetaToDelete();
    if (!receta || !receta.id) return;

    this.recetaService.deleteReceta(receta.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Receta eliminada correctamente.');
        this.loadRecetas(this.pagination()?.page);
      },
      error: (err) => {
        this.notificationService.showError('Error al eliminar la receta.');
      },
    });
    this.closeDeleteModal();
  }

  handleExportExcel(): void {
    this.recetaService.exportarRecetas().subscribe({
      next: (blob) => {
        // Crear URL del blob y descargar archivo
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `recetas_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.notificationService.showSuccess('Archivo Excel descargado exitosamente.');
      },
      error: (err) => {
        this.notificationService.showError('Error al exportar las recetas.');
      }
    });
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      activo: ''
    });
    this.loadRecetas(1);
  }

  closeDeleteModal(): void {
    this.isDeleteModalVisible.set(false);
    this.recetaToDelete.set(null);
  }
}