import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { finalize } from 'rxjs';

import { ProveedorService } from '../../services/proveedor.service';
import { Proveedor } from '../../../../../types/contract.types';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';
import { ActionConfig, ColumnConfig } from '../../../../../shared/components/data-table/data-table.types';
import { faEye, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-proveedores-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    DataTableComponent,
    PaginationComponent,
    ButtonComponent,
    SpinnerComponent
  ],
  templateUrl: './proveedores-list-page.component.html',
  styleUrl: './proveedores-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProveedoresListPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly proveedorService = inject(ProveedorService);
  private readonly notificationService = inject(NotificationService);

  proveedores = signal<Proveedor[]>([]);
  isLoading = signal(false);
  
  // Paginación
  currentPage = signal(1);
  totalPages = signal(1);
  totalItems = signal(0);
  itemsPerPage = signal(10);

  // Configuración de la tabla
  columns: ColumnConfig<Proveedor>[] = [
    { key: 'id', label: 'ID', type: 'text' },
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { 
      key: 'telefono', 
      label: 'Teléfono', 
      type: 'custom',
      customRender: (item) => item.telefono || 'Sin teléfono'
    },
    { 
      key: 'direccion', 
      label: 'Dirección', 
      type: 'custom',
      customRender: (item) => item.direccion || 'Sin dirección'
    }
  ];

  // Configuración de acciones
  actions: ActionConfig[] = [
    { icon: faEye, label: 'Ver', action: 'view' },
    { icon: faEdit, label: 'Editar', action: 'edit' },
    { icon: faTrash, label: 'Eliminar', action: 'delete', danger: true }
  ];

  ngOnInit(): void {
    this.loadProveedores();
  }

  loadProveedores(): void {
    this.isLoading.set(true);
    this.proveedorService.getProveedores(
      this.currentPage(),
      this.itemsPerPage()
    )
    .pipe(finalize(() => this.isLoading.set(false)))
    .subscribe({
      next: (response) => {
        this.proveedores.set(response.data || []);
        this.totalPages.set(response.pagination?.pages || 1);
        this.totalItems.set(response.pagination?.total || 0);
      },
      error: (error) => {
        console.error('Error loading proveedores:', error);
        this.notificationService.showError('Error al cargar los proveedores');
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadProveedores();
  }

  onTableAction(event: { action: string; item: Proveedor }): void {
    switch (event.action) {
      case 'view':
        this.router.navigate(['/admin/proveedores', event.item.id, 'view']);
        break;
      case 'edit':
        this.router.navigate(['/admin/proveedores', event.item.id, 'edit']);
        break;
      case 'delete':
        this.onDelete(event.item);
        break;
    }
  }

  private onDelete(proveedor: Proveedor): void {
    if (!proveedor.id) return;
    if (confirm(`¿Estás seguro de que deseas eliminar al proveedor "${proveedor.nombre}"?`)) {
      this.isLoading.set(true);
      this.proveedorService.deleteProveedor(proveedor.id)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: () => {
            this.notificationService.showSuccess('Proveedor eliminado correctamente');
            this.loadProveedores();
          },
          error: (error) => {
            console.error('Error deleting proveedor:', error);
            this.notificationService.showError('Error al eliminar el proveedor');
          }
        });
    }
  }

  createNew(): void {
    this.router.navigate(['/admin/proveedores/new']);
  }

  refresh(): void {
    this.currentPage.set(1);
    this.loadProveedores();
  }
}