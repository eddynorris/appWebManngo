import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { finalize } from 'rxjs';

import { PresentacionService } from '../../services/presentacion.service';
import { PresentacionProducto } from '../../../../../types/contract.types';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

import { ActionConfig, ColumnConfig } from '../../../../../shared/components/data-table/data-table.types';
import { faEye, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-presentaciones-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    DataTableComponent,
    PaginationComponent,
    ButtonComponent,

  ],
  templateUrl: './presentaciones-list-page.component.html',
  styleUrl: './presentaciones-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PresentacionesListPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly presentacionService = inject(PresentacionService);
  private readonly notificationService = inject(NotificationService);

  presentaciones = signal<PresentacionProducto[]>([]);
  isLoading = signal(false);
  
  // Paginación
  currentPage = signal(1);
  totalPages = signal(1);
  totalItems = signal(0);
  itemsPerPage = signal(10);

  // Configuración de la tabla
  columns: ColumnConfig<PresentacionProducto>[] = [
    { key: 'id', label: 'ID', type: 'text' },
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'producto.nombre', label: 'Producto', type: 'text' },
    { 
      key: 'capacidad_kg', 
      label: 'Capacidad (kg)', 
      type: 'custom',
      customRender: (item) => item.capacidad_kg ? `${item.capacidad_kg} kg` : 'No especificado'
    },
    { key: 'tipo', label: 'Tipo', type: 'text' },
    { 
      key: 'precio_venta', 
      label: 'Precio Venta', 
      type: 'custom',
      customRender: (item) => item.precio_venta ? `$${item.precio_venta}` : 'No definido'
    },
    { key: 'activo', label: 'Estado', type: 'status' }
  ];

  // Configuración de acciones
  actions: ActionConfig[] = [
    { icon: faEye, label: 'Ver', action: 'view' },
    { icon: faEdit, label: 'Editar', action: 'edit' },
    { icon: faTrash, label: 'Eliminar', action: 'delete', danger: true }
  ];

  ngOnInit(): void {
    this.loadPresentaciones();
  }

  loadPresentaciones(): void {
    this.isLoading.set(true);
    this.presentacionService.getPresentaciones(
      this.currentPage(),
      this.itemsPerPage()
    )
    .pipe(finalize(() => this.isLoading.set(false)))
    .subscribe({
      next: (response) => {
        this.presentaciones.set(response.data || []);
        this.totalPages.set(response.pagination?.pages || 1);
        this.totalItems.set(response.pagination?.total || 0);
      },
      error: (error) => {
        console.error('Error loading presentaciones:', error);
        this.notificationService.showError('Error al cargar las presentaciones');
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadPresentaciones();
  }

  onTableAction(event: { action: string; item: PresentacionProducto }): void {
    switch (event.action) {
      case 'view':
        this.router.navigate(['/admin/presentaciones', event.item.id, 'view']);
        break;
      case 'edit':
        this.router.navigate(['/admin/presentaciones', event.item.id, 'edit']);
        break;
      case 'delete':
        this.onDelete(event.item);
        break;
    }
  }

  private onDelete(presentacion: PresentacionProducto): void {
    if (!presentacion.id) return;
    if (confirm(`¿Estás seguro de que deseas eliminar la presentación "${presentacion.nombre}"?`)) {
      this.isLoading.set(true);
      this.presentacionService.deletePresentacion(presentacion.id)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: () => {
            this.notificationService.showSuccess('Presentación eliminada correctamente');
            this.loadPresentaciones();
          },
          error: (error) => {
            console.error('Error deleting presentacion:', error);
            this.notificationService.showError('Error al eliminar la presentación');
          }
        });
    }
  }

  createNew(): void {
    this.router.navigate(['/admin/presentaciones/new']);
  }

  refresh(): void {
    this.currentPage.set(1);
    this.loadPresentaciones();
  }
}