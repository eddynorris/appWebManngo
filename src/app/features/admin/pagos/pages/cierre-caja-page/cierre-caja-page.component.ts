import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendarAlt, faWarehouse, faUser, faMoneyBillWave, faReceipt, faCashRegister } from '@fortawesome/free-solid-svg-icons';
import { firstValueFrom } from 'rxjs';

import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { AlmacenService } from '../../../almacenes/services/almacen.service';
import { CierreCajaService } from '../../services/cierre-caja.service';
import { UserService } from '../../../users/services/user.service';
import { FilterConfig, FilterValues } from '../../../../../shared/components/table-filters/table-filters.component';
import { 
  CierreCajaResponse, 
  CierreCajaFilters,
  Almacen,
  User
} from '../../../../../types/contract.types';
import { ColumnConfig } from '../../../../../shared/components/data-table/data-table.types';

@Component({
  selector: 'app-cierre-caja-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    DataTableComponent,
    SpinnerComponent
  ],
  templateUrl: './cierre-caja-page.component.html',
  styleUrl: './cierre-caja-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CierreCajaPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cierreCajaService = inject(CierreCajaService);
  private readonly notificationService = inject(NotificationService);
  private readonly almacenService = inject(AlmacenService);
  private readonly userService = inject(UserService);

  // Icons
  readonly icons = {
    calendar: faCalendarAlt,
    warehouse: faWarehouse,
    user: faUser,
    money: faMoneyBillWave,
    receipt: faReceipt,
    cashRegister: faCashRegister
  };

  // Signals
  readonly isLoading = signal(false);
  readonly cierreCajaData = signal<CierreCajaResponse | null>(null);
  readonly almacenes = signal<Almacen[]>([]);
  readonly usuarios = signal<User[]>([]);
  
  // Form
  filters = signal<FilterConfig[]>([]);
  initialFilterValues: FilterValues;
  filtersForm: FormGroup;


  // Computed values
  readonly resumen = computed(() => this.cierreCajaData()?.resumen);
  readonly detalles = computed(() => this.cierreCajaData()?.detalles);

  // Table configurations
  readonly pagosColumns: ColumnConfig<any>[] = [
    { key: 'fecha', label: 'Fecha', type: 'date' },
    { key: 'venta.cliente.nombre', label: 'Cliente', type: 'text' },
    { key: 'monto', label: 'Monto', type: 'currency' },
    { key: 'metodo_pago', label: 'Método', type: 'text' },
    { key: 'usuario.username', label: 'Usuario', type: 'text' }
  ];

  readonly gastosColumns: ColumnConfig<any>[] = [
    { key: 'fecha', label: 'Fecha', type: 'date' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    { key: 'monto', label: 'Monto', type: 'currency' },
    { key: 'categoria', label: 'Categoría', type: 'text' },
    { key: 'usuario.username', label: 'Usuario', type: 'text' }
  ];

  constructor() {
    const today = new Date().toISOString().split('T')[0];
    this.initialFilterValues = {
      fecha_inicio: today,
      fecha_fin: today,
      almacen_id: null,
      usuario_id: null
    };
    
    // Initialize form
    this.filtersForm = this.fb.group({
      fecha_inicio: [today, Validators.required],
      fecha_fin: [today, Validators.required],
      almacen_id: [null],
      usuario_id: [null]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    try {
      const [almacenes, usuariosResponse] = await Promise.all([
        firstValueFrom(this.almacenService.getAlmacenes()),
        firstValueFrom(this.userService.getUsers(1, 100)) // Load first 100 users
      ]);
      
      this.almacenes.set(almacenes);
      this.usuarios.set(usuariosResponse.data);

      this.setupFilters();
      this.aplicarFiltros(this.initialFilterValues);

    } catch (error) {
      this.notificationService.showError('Error al cargar datos iniciales');
      console.error(error);
    }
  }

  private setupFilters(): void {
    this.filters.set([
      { key: 'fecha_inicio', label: 'Fecha Inicio *', type: 'date', colSpan: 1 },
      { key: 'fecha_fin', label: 'Fecha Fin *', type: 'date', colSpan: 1 },
      { 
        key: 'almacen_id', 
        label: 'Almacén', 
        type: 'select', 
        options: this.almacenes().map(a => ({ value: a.id, label: a.nombre || '' })),
        placeholder: 'Todos los almacenes',
        colSpan: 1
      },
      { 
        key: 'usuario_id', 
        label: 'Usuario/Vendedor', 
        type: 'select',
        options: this.usuarios().map(u => ({ value: u.id, label: u.username || '' })),
        placeholder: 'Todos los usuarios',
        colSpan: 1
      }
    ]);
  }

  aplicarFiltros(filters: FilterValues): void {
    if (!filters['fecha_inicio'] || !filters['fecha_fin']) {
      this.notificationService.showError('Por favor, complete los campos de fecha requeridos');
      return;
    }

    const apiFilters: CierreCajaFilters = {
      fecha_inicio: filters['fecha_inicio'] + 'T00:00:00Z',
      fecha_fin: filters['fecha_fin'] + 'T23:59:59Z',
      almacen_id: filters['almacen_id'] || undefined,
      usuario_id: filters['usuario_id'] || undefined
    };

    this.isLoading.set(true);

    this.cierreCajaService.getCierreCaja(apiFilters).subscribe({
      next: (data) => {
        this.cierreCajaData.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar cierre de caja:', error);
        this.notificationService.showError('Error al cargar los datos del cierre de caja');
        this.isLoading.set(false);
      }
    });
  }

  limpiarFiltros(): void {
    const today = new Date().toISOString().split('T')[0];
    this.initialFilterValues = { ...this.initialFilterValues, fecha_inicio: today, fecha_fin: today, almacen_id: null, usuario_id: null };
    this.aplicarFiltros(this.initialFilterValues);
  }

  // Formatear moneda para mostrar en las tarjetas
  formatCurrency(value: string | number): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(numValue);
  }
}