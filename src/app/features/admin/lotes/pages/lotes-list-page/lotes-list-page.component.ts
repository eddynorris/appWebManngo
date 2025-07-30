import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faEdit, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';

import { LoteService } from '../../services/lote.service';
import { Lote } from '../../../../../types/contract.types';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig, ActionConfig } from '../../../../../shared/components/data-table/data-table.types';
import { NotificationService } from '../../../../../shared/services/notification.service';

@Component({
  selector: 'app-lotes-list-page',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, DataTableComponent],
  templateUrl: './lotes-list-page.component.html',
  styleUrl: './lotes-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LotesListPageComponent implements OnInit {
  private readonly loteService = inject(LoteService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  // FontAwesome icons
  faPlus = faPlus;
  faEdit = faEdit;
  faTrash = faTrash;
  faEye = faEye;

  lotes = signal<Lote[]>([]);
  isLoading = signal(false);

  // Configuración de columnas para la tabla
  columns: ColumnConfig<Lote>[] = [
    { key: 'id', label: 'ID', type: 'text' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    { key: 'producto.nombre', label: 'Producto', type: 'text' },
    { key: 'proveedor.nombre', label: 'Proveedor', type: 'text' },
    { key: 'peso_humedo_kg', label: 'Peso Húmedo (kg)', type: 'text' },
    { key: 'peso_seco_kg', label: 'Peso Seco (kg)', type: 'text' },
    { key: 'cantidad_disponible_kg', label: 'Disponible (kg)', type: 'text' },
  ];

  // Acciones disponibles para cada fila
  actions: ActionConfig[] = [
    {
      label: 'Ver',
      icon: this.faEye,
      action: 'view'
    },
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

  loadLotes(): void {
    this.isLoading.set(true);
    this.loteService.getLotes().subscribe({
      next: (response) => {
        this.lotes.set(response.data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading lotes:', error);
        this.notificationService.showError('Error al cargar los lotes');
        this.isLoading.set(false);
      }
    });
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
        this.deleteLote(item.id!);
        break;
    }
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

  deleteLote(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este lote? Esta acción no se puede deshacer.')) {
      this.loteService.deleteLote(id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Lote eliminado correctamente');
          this.loadLotes();
        },
        error: (error) => {
          console.error('Error deleting lote:', error);
          this.notificationService.showError('Error al eliminar el lote');
        }
      });
    }
  }

}