import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators'; // Importar map

import { InventarioService } from '../../services/inventario.service';
import { AlmacenService } from '../../../almacenes/services/almacen.service';
import { Inventario, Pagination, Almacen, InventariosResponse } from '../../../../../types/contract.types';

import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig } from '../../../../../shared/components/data-table/data-table.types';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { LoadingService } from '../../../../../shared/services/loading.service';

@Component({
  selector: 'app-inventarios-page',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    PaginationComponent,
  ],
  templateUrl: './inventarios-page.component.html',
  styleUrl: './inventarios-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InventariosPageComponent implements OnInit {
  private readonly inventarioService = inject(InventarioService);
  private readonly almacenService = inject(AlmacenService);
  private readonly notificationService = inject(NotificationService);
  public readonly loadingService = inject(LoadingService);

  inventario = signal<Inventario[]>([]);
  pagination = signal<Pagination | null>(null);

  almacenes = signal<Almacen[]>([]);
  selectedAlmacen = signal<number | undefined>(undefined);

  columns: ColumnConfig<Inventario>[] = [
    { key: 'almacen.nombre', label: 'Almacén', type: 'text' },
    { key: 'presentacion.nombre', label: 'Producto', type: 'text' },
    { key: 'presentacion.capacidad_kg', label: 'Capacidad (kg)', type: 'text' },
    { key: 'cantidad', label: 'Cantidad Actual', type: 'text' },
    { key: 'stock_minimo', label: 'Stock Mínimo', type: 'text' },
  ];

  ngOnInit(): void {
    this.loadAlmacenes();
    this.loadInventario();
  }

  loadAlmacenes(): void {
    this.almacenService.getAlmacenes().pipe(
      map((response: any) => {
        // Comprobar si la respuesta es un objeto con una propiedad 'data' (paginada)
        if (response && Array.isArray(response.data)) {
          return response.data;
        }
        // Si no, asumir que es un array plano
        return response;
      })
    ).subscribe({
      next: (data: Almacen[]) => {
        if (Array.isArray(data)) {
          this.almacenes.set(data);
        } else {
          this.notificationService.showError('Error: formato de datos de almacenes incorrecto.');
        }
      },
      error: (err: any) => {
        this.notificationService.showError('Error al cargar los almacenes.');
      }
    });
  }

  loadInventario(page: number = 1): void {
    const almacenId = this.selectedAlmacen();
    this.inventarioService.getInventarios(page, 10, almacenId).subscribe({
      next: (response: InventariosResponse) => {
        this.inventario.set(response.data);
        this.pagination.set(response.pagination);
      },
      error: (err: any) => {
        this.notificationService.showError('Error al cargar el inventario.');
      },
    });
  }

  onAlmacenChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const almacenId = target.value ? Number(target.value) : undefined;
    this.selectedAlmacen.set(almacenId);
    this.loadInventario();
  }

  onPageChange(page: number): void {
    this.loadInventario(page);
  }
}
