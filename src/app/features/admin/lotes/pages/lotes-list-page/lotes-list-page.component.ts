import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faEdit, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import { finalize } from 'rxjs';

import { LoteService } from '../../services/lote.service';
import { Lote, Pagination } from '../../../../../types/contract.types';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig, ActionConfig } from '../../../../../shared/components/data-table/data-table.types';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { LoadingService } from '../../../../../shared/services/loading.service';
import { ConfirmationModalComponent } from '../../../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-lotes-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FontAwesomeModule,
    DataTableComponent,
    PaginationComponent,
    ConfirmationModalComponent,
  ],
  templateUrl: './lotes-list-page.component.html',
  styleUrl: './lotes-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LotesListPageComponent implements OnInit {
  private readonly loteService = inject(LoteService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);

  // FontAwesome icons
  faPlus = faPlus;
  faEdit = faEdit;
  faTrash = faTrash;
  faEye = faEye;

  lotes = signal<Lote[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = this.loadingService.isLoading;
  isDeleteModalVisible = signal(false);
  loteToDelete = signal<Lote | null>(null);

  // Configuración de columnas para la tabla
  columns: ColumnConfig<Lote>[] = [
    { key: 'id', label: 'ID', type: 'text' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    { key: 'producto.nombre', label: 'Producto', type: 'text' },
    { key: 'proveedor.nombre', label: 'Proveedor', type: 'text' },
    { key: 'peso_humedo_kg', label: 'Peso Húmedo (kg)', type: 'text' },
    { key: 'peso_seco_kg', label: 'Peso Seco (kg)', type: 'text' },
    { key: 'cantidad_disponible_kg', label: 'Disponible (kg)', type: 'text' },
    { key: 'is_active', label: 'Estado', type: 'status' },
    { key: 'actions', label: 'Acciones', type: 'actions' },
  ];

  // Acciones disponibles para cada fila
  actions: ActionConfig[] = [
    {
      label: 'Editar',
      icon: this.faEdit,
      action: 'edit'
    },
    {
      label: 'Eliminar',
      icon: this.faTrash,
      action: 'delete',
      danger: true
    }
  ];

  ngOnInit(): void {
    this.loadLotes();
  }

  loadLotes(page: number = 1, perPage: number = 10): void {
    this.loadingService.startLoading();
    this.loteService.getLotes(page, perPage)
      .pipe(finalize(() => this.loadingService.stopLoading()))
      .subscribe({
        next: (response) => {
          this.lotes.set(response.data);
          this.pagination.set(response.pagination);
        },
        error: (error) => {
          console.error('Error loading lotes:', error);
          this.notificationService.showError('Error al cargar los lotes');
        }
      });
  }

  onPageChange(page: number): void {
    const currentPagination = this.pagination();
    if (currentPagination) {
      this.loadLotes(page, currentPagination.per_page);
    }
  }

  onPerPageChange(perPage: number): void {
    this.loadLotes(1, perPage);
  }

  onAction(event: { action: string; item: Lote }): void {
    const { action, item } = event;
    
    switch (action) {
      case 'view':
        this.viewLote(item.id!);
        break;
      case 'edit':
        this.editLote(item.id!);
        break;
      case 'delete':
        this.showDeleteModal(item);
        break;
      default:
        console.warn('Acción no reconocida:', action);
    }
  }

  handleTableAction(event: { action: string; item: Lote }): void {
    this.onAction(event);
  }

  createLote(): void {
    this.router.navigate(['/admin/lotes/new']);
  }

  viewLote(id: number): void {
    this.router.navigate(['/admin/lotes', id]);
  }

  editLote(id: number): void {
    this.router.navigate(['/admin/lotes', id, 'edit']);
  }

  showDeleteModal(lote: Lote): void {
    this.loteToDelete.set(lote);
    this.isDeleteModalVisible.set(true);
  }

  handleDeleteConfirmation(): void {
    const lote = this.loteToDelete();
    if (!lote) return;

    this.loadingService.startLoading();
    this.loteService.deleteLote(lote.id!)
      .pipe(finalize(() => this.loadingService.stopLoading()))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Lote eliminado exitosamente');
          this.closeDeleteModal();
          this.loadLotes();
        },
        error: (error) => {
          console.error('Error deleting lote:', error);
          this.notificationService.showError('Error al eliminar el lote');
        }
      });
  }

  closeDeleteModal(): void {
    this.isDeleteModalVisible.set(false);
    this.loteToDelete.set(null);
  }

}