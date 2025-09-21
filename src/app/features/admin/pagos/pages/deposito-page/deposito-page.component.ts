import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faCashRegister, 
  faMoneyBill, 
  faCalendarAlt, 
  faFileUpload,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faFilter,
  faSearch,
  faPlus,
  faSave
} from '@fortawesome/free-solid-svg-icons';

import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';
import { CierreCajaService } from '../../services/cierre-caja.service';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { UserService } from '../../../users/services/user.service';
import { 
  PagoPendienteDeposito, 
  RegistroDepositoRequest, 
  RegistroDepositoResponse,
  User,
  Pagination
} from '../../../../../types/contract.types';
import { ColumnConfig } from '../../../../../shared/components/data-table/data-table.types';

@Component({
  selector: 'app-deposito-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    DataTableComponent,
    PaginationComponent,
    SpinnerComponent
  ],
  templateUrl: './deposito-page.component.html',
  styleUrl: './deposito-page.component.scss'
})
export default class DepositoPageComponent implements OnInit {
  private cierreCajaService = inject(CierreCajaService);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  // Icons
  icons = {
    cashRegister: faCashRegister,
    money: faMoneyBill,
    calendar: faCalendarAlt,
    upload: faFileUpload,
    check: faCheck,
    times: faTimes,
    warning: faExclamationTriangle,
    filter: faFilter,
    search: faSearch,
    plus: faPlus,
    save: faSave
  };

  // --- State Signals ---
  pagosPendientes = signal<PagoPendienteDeposito[]>([]);
  usuarios = signal<User[]>([]);
  loading = signal(false);
  
  // Modal signals
  isModalVisible = signal(false);
  isSubmitting = signal(false);
  
  // Pagination signals
  pagination = signal<Pagination | null>(null);
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = signal(0);
  
  // Filter signals
  fechaInicio = signal('');
  fechaFin = signal('');
  almacenSeleccionado = signal<number | null>(null);
  filters = signal<any>({});
  
  // Selection signals
  pagosSeleccionados = signal<Set<number>>(new Set());
  montosDepositados = signal<Map<number, string>>(new Map());
  
  // Computed
  isLoading = computed(() => this.loading());

  // Form
  depositoForm: FormGroup;
  filtersForm: FormGroup;

  // Computed values
  totalSeleccionado = computed(() => {
    const seleccionados = this.pagosSeleccionados();
    const montosDepositados = this.montosDepositados();
    
    let total = 0;
    seleccionados.forEach(pagoId => {
      const montoDepositado = montosDepositados.get(pagoId);
      if (montoDepositado) {
        total += parseFloat(montoDepositado) || 0;
      }
    });
    
    return total;
  });

  hayPagosSeleccionados = computed(() => this.pagosSeleccionados().size > 0);

  // Computed para obtener los datos completos de los pagos seleccionados
  pagosSeleccionadosDetalle = computed(() => {
    const seleccionados = this.pagosSeleccionados();
    const pagos = this.pagosPendientes();
    const montosDepositados = this.montosDepositados();
    
    return pagos
      .filter(pago => seleccionados.has(pago.id))
      .map(pago => ({
        ...pago,
        montoDepositado: montosDepositados.get(pago.id) || pago.monto
      }));
  });

  // Column configuration for DataTable
  pagosColumns: ColumnConfig<PagoPendienteDeposito>[] = [
    {
      key: 'selected',
      label: '',
      type: 'custom'
    },
    {
      key: 'fecha',
      label: 'Fecha',
      type: 'date'
    },
    {
      key: 'venta.cliente.nombre',
      label: 'Cliente',
      type: 'text'
    },
    {
      key: 'monto',
      label: 'Monto Original',
      type: 'currency'
    },
    {
      key: 'monto_depositado',
      label: 'Monto Depositado',
      type: 'custom'
    },
    {
      key: 'metodo_pago',
      label: 'Método',
      type: 'text'
    },
    {
      key: 'usuario.username',
      label: 'Usuario',
      type: 'text'
    }
  ];

  constructor() {
    this.depositoForm = this.fb.group({
      fecha_deposito: [new Date().toISOString().split('T')[0], Validators.required],
      referencia_bancaria: [''],
      comprobante: [null]
    });

    this.filtersForm = this.fb.group({
      fecha_inicio: [''],
      fecha_fin: [''],
      cliente: [''],
      metodo_pago: ['']
    });
  }

  ngOnInit(): void {
    this.cargarPagosPendientes();
    this.cargarUsuarios();
  }

  cargarPagosPendientes(): void {
    this.loading.set(true);
    
    const filters = {
      fecha_inicio: this.fechaInicio(),
      fecha_fin: this.fechaFin(),
      almacen_id: this.almacenSeleccionado() ?? undefined
    };

    this.cierreCajaService.getPagosPendientesDeposito(this.currentPage(), this.pageSize(), filters)
      .subscribe({
        next: (response) => {
          // Handle the new API response structure
          if (response && response.data && Array.isArray(response.data)) {
            this.pagosPendientes.set(response.data);
            
            // Update pagination signals with API response
            if (response.pagination) {
              this.totalItems.set(response.pagination.total);
              this.currentPage.set(response.pagination.page);
              this.totalPages.set(response.pagination.pages);
              this.pagination.set(response.pagination);
            }
          } else {
            // Fallback for unexpected response structure
            console.warn('Unexpected API response structure:', response);
            this.pagosPendientes.set([]);
          }
        },
        error: (error) => {
          console.error('Error al cargar pagos pendientes:', error);
          this.pagosPendientes.set([]);
        },
        complete: () => {
          this.loading.set(false);
        }
      });
  }

  async cargarUsuarios(): Promise<void> {
    try {
      const response = await firstValueFrom(this.userService.getUsers(1, 100));
      this.usuarios.set(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      this.notificationService.showError('Error al cargar la lista de usuarios');
    }
  }

  private mapearPagoDeposito(item: any): PagoPendienteDeposito {
    return {
      id: item.id || 0,
      monto: item.monto || '0',
      monto_depositado: item.monto_depositado || null,
      monto_en_gerencia: item.monto_en_gerencia || '0',
      fecha: item.fecha || new Date().toISOString().split('T')[0],
      metodo_pago: item.metodo_pago || 'efectivo',
      referencia: item.referencia || '',
      url_comprobante: item.url_comprobante || null,
      depositado: item.depositado || false,
      fecha_deposito: item.fecha_deposito || null,
      venta_id: item.venta?.id || item.venta_id || 0,
      usuario_id: item.usuario?.id || item.usuario_id || 0,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
      venta: item.venta || {
        id: item.venta_id || 0,
        total: '0',
        cliente: {
          id: item.cliente?.id || 0,
          nombre: item.cliente?.nombre || 'Cliente no disponible'
        }
      },
      usuario: item.usuario || {
        id: item.usuario_id || 0,
        username: 'Usuario no disponible'
      },
      cliente: item.venta?.cliente || item.cliente
    };
  }

  togglePagoSeleccion(pagoId: number): void {
    const seleccionados = new Set(this.pagosSeleccionados());
    const montosDepositados = new Map(this.montosDepositados());
    
    if (seleccionados.has(pagoId)) {
      seleccionados.delete(pagoId);
      montosDepositados.delete(pagoId);
    } else {
      seleccionados.add(pagoId);
      // Inicializar con el monto original del pago
      const pago = this.pagosPendientes().find(p => p.id === pagoId);
      if (pago) {
        montosDepositados.set(pagoId, pago.monto);
      }
    }
    
    this.pagosSeleccionados.set(seleccionados);
    this.montosDepositados.set(montosDepositados);
  }

  seleccionarTodos(): void {
    const pagos = this.pagosPendientes();
    if (!Array.isArray(pagos)) {
      return;
    }
    const todosLosIds = new Set(pagos.map(pago => pago.id));
    const montosDepositados = new Map<number, string>();
    
    // Inicializar montos depositados con el monto original de cada pago
    pagos.forEach(pago => {
      montosDepositados.set(pago.id, pago.monto);
    });
    
    this.pagosSeleccionados.set(todosLosIds);
    this.montosDepositados.set(montosDepositados);
  }

  deseleccionarTodos(): void {
    this.pagosSeleccionados.set(new Set());
    this.montosDepositados.set(new Map());
  }

  abrirModalDeposito(): void {
    if (!this.hayPagosSeleccionados()) {
      this.notificationService.showWarning('Debe seleccionar al menos un pago');
      return;
    }
    
    this.isModalVisible.set(true);
  }

  cerrarModal(): void {
    this.isModalVisible.set(false);
    this.depositoForm.reset({
      fecha_deposito: new Date().toISOString().split('T')[0],
      referencia_bancaria: '',
      comprobante: null
    });
    
    // Limpiar el input file
    const fileInput = document.getElementById('comprobante') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async confirmarDeposito(): Promise<void> {
    if (this.depositoForm.invalid || !this.hayPagosSeleccionados()) {
      this.notificationService.showWarning('Complete todos los campos requeridos');
      return;
    }

    // Validar que todos los pagos seleccionados tengan monto depositado
    const montosDepositados = this.montosDepositados();
    const pagosSeleccionados = this.pagosSeleccionados();
    
    for (const pagoId of pagosSeleccionados) {
      const monto = montosDepositados.get(pagoId);
      if (!monto || parseFloat(monto) <= 0) {
        this.notificationService.showWarning('Todos los pagos seleccionados deben tener un monto depositado válido');
        return;
      }
    }

    try {
      this.isSubmitting.set(true);
      
      const formValue = this.depositoForm.value;
      
      // Construir el array de depósitos según el nuevo formato
      const depositos = Array.from(pagosSeleccionados).map(pagoId => ({
        pago_id: pagoId,
        monto_depositado: montosDepositados.get(pagoId) || '0'
      }));
      
      const fechaDeposito = new Date(formValue.fecha_deposito).toISOString();
      const referenciaBancaria = formValue.referencia_bancaria;
      const comprobante = formValue.comprobante;

      let response: RegistroDepositoResponse;

      // Si hay comprobante, usar FormData (multipart/form-data)
      if (comprobante) {
        const formData = new FormData();
        formData.append('depositos', JSON.stringify(depositos));
        formData.append('fecha_deposito', fechaDeposito);
        if (referenciaBancaria) {
          formData.append('referencia_bancaria', referenciaBancaria);
        }
        formData.append('comprobante_deposito', comprobante);

        response = await firstValueFrom(this.cierreCajaService.registrarDepositoConComprobante(formData));
        
        this.notificationService.showSuccess(
          'Depósito registrado exitosamente con comprobante',
          `Se registró el depósito por ${this.formatCurrency(this.totalSeleccionado())}`
        );
      } else {
        // Si no hay comprobante, usar JSON
        const request: RegistroDepositoRequest = {
          depositos: depositos,
          fecha_deposito: fechaDeposito
        };

        if (referenciaBancaria) {
          request.referencia_bancaria = referenciaBancaria;
        }

        response = await firstValueFrom(this.cierreCajaService.registrarDeposito(request));
        
        this.notificationService.showSuccess(
          'Depósito registrado exitosamente',
          `Se registró el depósito por ${this.formatCurrency(this.totalSeleccionado())}`
        );
      }

      // Actualizar la tabla eliminando los pagos procesados
      const pagosActuales = this.pagosPendientes();
      if (Array.isArray(pagosActuales)) {
        const pagosActualizados = pagosActuales.filter(
          pago => !this.pagosSeleccionados().has(pago.id)
        );
        this.pagosPendientes.set(pagosActualizados);
      }
      
      // Limpiar selección
      this.pagosSeleccionados.set(new Set());
      this.montosDepositados.set(new Map());
      this.cerrarModal();

    } catch (error) {
      console.error('Error al registrar depósito:', error);
      this.notificationService.showError('Error al registrar el depósito');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        this.notificationService.showWarning('Solo se permiten archivos JPG, PNG o PDF');
        target.value = '';
        this.depositoForm.patchValue({ comprobante: null });
        return;
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.showWarning('El archivo no debe superar los 5MB');
        target.value = '';
        this.depositoForm.patchValue({ comprobante: null });
        return;
      }

      // Asignar archivo al formulario
      this.depositoForm.patchValue({ comprobante: file });
      this.notificationService.showSuccess(`Archivo seleccionado: ${file.name}`);
    } else {
      // Si no hay archivo, limpiar el campo
      this.depositoForm.patchValue({ comprobante: null });
    }
  }

  formatCurrency(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(num);
  }

  isPagoSeleccionado(pagoId: number): boolean {
    return this.pagosSeleccionados().has(pagoId);
  }

  isValidArray(value: any): boolean {
    return Array.isArray(value);
  }

actualizarMontoDepositado(pagoId: number, event: Event): void {
  // 1. Convertimos el target del evento a un tipo específico (HTMLInputElement)
  const inputElement = event.target as HTMLInputElement;

  // 2. Extraemos el valor de forma segura
  const nuevoMonto = inputElement.value;

  // 3. Tu lógica existente ahora funciona con el valor correcto
  const montosDepositados = new Map(this.montosDepositados());
  montosDepositados.set(pagoId, nuevoMonto);
  this.montosDepositados.set(montosDepositados);
}

  getMontoDepositado(pagoId: number): string {
    return this.montosDepositados().get(pagoId) || '';
  }

  // Filter methods
  aplicarFiltros(filters: any): void {
    console.log('Aplicando filtros:', filters);
    // Aquí implementarías la lógica de filtrado
    // Por ejemplo, llamar al servicio con los filtros
    this.cargarPagosPendientes();
  }

  limpiarFiltros(): void {
    this.filtersForm.reset();
    this.cargarPagosPendientes();
  }

  // Modal methods
  registrarDeposito(): void {
    this.abrirModalDeposito();
  }

  // Pagination methods
  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.cargarPagosPendientes();
  }

  onPerPageChange(perPage: number): void {
    this.pageSize.set(perPage);
    this.currentPage.set(1); // Reset to page 1 when changing per page
    this.cargarPagosPendientes();
  }
}