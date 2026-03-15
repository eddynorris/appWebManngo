import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';

import { GastoService } from '../../services/gasto.service';
import { AlmacenService } from '../../../almacenes/services/almacen.service';
import { UserService } from '../../../users/services/user.service';
import { LoteService } from '../../../lotes/services/lote.service';
import { Gasto, Pagination, Almacen, User, Lote } from '../../../../../types/contract.types';

import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig, ActionConfig } from '../../../../../shared/components/data-table/data-table.types';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { LoadingService } from '../../../../../shared/services/loading.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { ConfirmationModalComponent } from '../../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { faEdit, faTrash, faPlus, faDownload, faFilterCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-gastos-list-page',
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
  templateUrl: './gastos-list-page.component.html',
  styleUrl: './gastos-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GastosListPageComponent implements OnInit {
  private readonly gastoService = inject(GastoService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly fb = inject(FormBuilder);
  protected readonly authService = inject(AuthService);
  private readonly almacenService = inject(AlmacenService);
  private readonly userService = inject(UserService);
  private readonly loteService = inject(LoteService);

  // FontAwesome icons
  faPlus = faPlus;
  faDownload = faDownload;
  faFilterCircleXmark = faFilterCircleXmark;

  // Data for dropdowns
  almacenes = signal<Almacen[]>([]);
  usuarios = signal<User[]>([]);
  lotes = signal<Lote[]>([]);
  categorias = ['logistica', 'mantenimiento', 'insumos', 'servicios', 'otros'];

  gastos = signal<Gasto[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = this.loadingService.isLoading;
  isDeleteModalVisible = signal(false);
  gastoToDelete = signal<Gasto | null>(null);
  filterForm!: FormGroup;

  columns: ColumnConfig<Gasto>[] = [
    { key: 'fecha', label: 'Fecha', type: 'date' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    { key: 'categoria', label: 'Categoría', type: 'text' },
    { key: 'monto', label: 'Monto', type: 'currency' },
    { key: 'almacen.nombre', label: 'Almacén', type: 'text' },
    { key: 'usuario.username', label: 'Registrado por', type: 'text' },
    { key: 'actions', label: 'Acciones', type: 'actions' },
  ];

  actions: ActionConfig[] = [
    { icon: faEdit, label: '', action: 'edit' },
    { icon: faTrash, label: '', action: 'delete', danger: true },
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadDropdownData();
    this.loadGastos();
    this.setupFiltersCallback();
  }

  private loadDropdownData(): void {
    this.almacenService.getAlmacenes().subscribe(data => this.almacenes.set(data));
    this.userService.getUsers(1, 1000).subscribe(res => this.usuarios.set(res.data));
    this.loteService.getLotes(1, 1000).subscribe(res => this.lotes.set(res.data));
  }

  private initForm(): void {
    this.filterForm = this.fb.group({
      categoria: [''],
      fecha_inicio: [''],
      fecha_fin: [''],
      almacen_id: [''],
      usuario_id: [''],
      lote_id: [''],
      sort_by: ['fecha'],
      sort_order: ['desc'],
    });
  }

  clearFilters(): void {
    this.filterForm.reset({
      categoria: '',
      fecha_inicio: '',
      fecha_fin: '',
      almacen_id: '',
      usuario_id: '',
      lote_id: '',
      sort_by: 'fecha',
      sort_order: 'desc',
    });
  }

  private setupFiltersCallback(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.loadGastos();
      });
  }

  loadGastos(page: number = 1, per_page: number = 10): void {
    this.loadingService.startLoading();
    const filters = this.filterForm.value;
    this.gastoService.getGastos(page, per_page, filters)
      .pipe(finalize(() => this.loadingService.stopLoading()))
      .subscribe({
        next: (response) => {
          this.gastos.set(response.data);
          this.pagination.set(response.pagination);
        },
        error: (err) => {
          this.notificationService.showError('Error al cargar los gastos.');
        },
      });
  }

  onPageChange(page: number): void {
    const perPage = this.pagination()?.per_page || 10;
    this.loadGastos(page, perPage);
  }

  onPerPageChange(perPage: number): void {
    this.loadGastos(1, perPage); // Reset to page 1 when changing per page
  }

  handleTableAction(event: { action: string; item: Gasto }): void {
    if (event.action === 'edit') {
      this.router.navigate(['/admin/gastos/edit', event.item.id]);
    } else if (event.action === 'delete') {
      this.gastoToDelete.set(event.item);
      this.isDeleteModalVisible.set(true);
    }
  }

  handleDeleteConfirmation(): void {
    const gasto = this.gastoToDelete();
    if (!gasto || !gasto.id) return;

    this.gastoService.deleteGasto(gasto.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Gasto eliminado correctamente.');
        const currentPage = this.pagination()?.page || 1;
        const currentPerPage = this.pagination()?.per_page || 10;
        this.loadGastos(currentPage, currentPerPage);
      },
      error: (err) => {
        this.notificationService.showError('Error al eliminar el gasto.');
      },
    });
    this.closeDeleteModal();
  }

  handleExportExcel(): void {
    this.gastoService.exportarGastos().subscribe({
      next: (blob) => {
        // Crear URL del blob y descargar archivo
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gastos_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.notificationService.showSuccess('Archivo Excel descargado exitosamente.');
      },
      error: (err) => {
        this.notificationService.showError('Error al exportar los gastos.');
      }
    });
  }

  closeDeleteModal(): void {
    this.isDeleteModalVisible.set(false);
    this.gastoToDelete.set(null);
  }
}
