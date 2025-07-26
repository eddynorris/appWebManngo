import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { VentaService } from '../../services/venta.service';
import { Venta, Pagination } from '../../../../../types/contract.types';

import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig, ActionConfig } from '../../../../../shared/components/data-table/data-table.types';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { VentaDetalleModalComponent } from '../../components/venta-detalle-modal/venta-detalle-modal.component';
import { faEdit, faEye } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-ventas-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    DataTableComponent,
    PaginationComponent,
    VentaDetalleModalComponent,
  ],
  templateUrl: './ventas-list-page.component.html',
  styleUrl: './ventas-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VentasListPageComponent implements OnInit {
  private readonly ventaService = inject(VentaService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  ventas = signal<Venta[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(false);
  isModalVisible = signal(false);
  selectedVenta = signal<Venta | null>(null);

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
  ];

  ngOnInit(): void {
    this.loadVentas();
  }

  loadVentas(page: number = 1, limit: number = 10): void {
    this.isLoading.set(true);
    this.ventaService.getVentas(page, limit).subscribe({
      next: (response) => {
        this.ventas.set(response.data);
        this.pagination.set(response.pagination);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.showError('Error al cargar las ventas.');
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    this.loadVentas(page);
  }

  onPerPageChange(perPage: number): void {
    this.loadVentas(1, perPage); // Reset to page 1 when changing per page
  }

  handleTableAction(event: { action: string; item: Venta }): void {
    const { action, item } = event;
    if (action === 'edit') {
      this.router.navigate(['/admin/ventas/edit', item.id]);
    } else if (action === 'view') {
      this.selectedVenta.set(item);
      this.isModalVisible.set(true);
    }
  }

  handleCloseModal(): void {
    this.isModalVisible.set(false);
    this.selectedVenta.set(null);
  }
}
