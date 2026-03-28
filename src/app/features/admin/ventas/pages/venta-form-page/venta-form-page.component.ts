import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash, faTimesCircle, faMicrophone, faPaperPlane, faBoxOpen } from '@fortawesome/free-solid-svg-icons';

import { VentaService } from '../../services/venta.service';
import { Venta, Cliente, Almacen, PresentacionDisponible } from '../../../../../types/contract.types';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { ClientSelectComponent } from '../../../../../shared/components/client-select/client-select.component';
import { VoiceCommandService, VoiceCommandResponse } from '../../../../../core/services/voice-command.service';
import { VoiceResultModalComponent } from '../../components/voice-result-modal/voice-result-modal.component';
import { ProductSelectionModalComponent } from '../../components/product-selection-modal/product-selection-modal.component';
import { FormFieldErrorComponent } from '../../../../../shared/components/form-field-error/form-field-error.component';

// Métodos de pago disponibles
const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'deposito', label: 'Depósito' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'yape_plin', label: 'Yape / Plin' },
  { value: 'otro', label: 'Otro' },
] as const;

@Component({
  selector: 'app-venta-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    ClientSelectComponent,
    VoiceResultModalComponent,
    ProductSelectionModalComponent,
    FormFieldErrorComponent,
  ],
  templateUrl: './venta-form-page.component.html',
  styleUrl: './venta-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VentaFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly ventaService = inject(VentaService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  readonly voiceCommandService = inject(VoiceCommandService);

  // FontAwesome icons
  faTrash = faTrash;
  faTimesCircle = faTimesCircle;
  faMicrophone = faMicrophone;
  faPaperPlane = faPaperPlane;
  faBoxOpen = faBoxOpen;

  // Opciones de método de pago
  readonly metodosPago = METODOS_PAGO;

  // Voice command input
  commandInput = new FormControl('');

  ventaForm: FormGroup;
  isLoading = signal(false);
  isEditMode = signal(false);
  ventaId = signal<number | null>(null);

  // Data signals
  clientes = signal<Cliente[]>([]);
  almacenes = signal<Almacen[]>([]);
  presentaciones = signal<PresentacionDisponible[]>([]);

  // Product modal state
  isProductModalOpen = signal(false);

  // Voice modal state
  showVoiceModal = signal(false);
  voiceData = signal<VoiceCommandResponse['data'] | null>(null);

  // Para saber si el admin puede elegir almacén
  canSelectAlmacen = computed(() => this.authService.isAdmin() && this.almacenes().length > 0);

  // Signal para forzar la reactividad del total
  private totalUpdateTrigger = signal(0);

  // Computed para calcular el total de la venta
  ventaTotal = computed(() => {
    this.totalUpdateTrigger();
    return this.detalles.controls.reduce((total, control) => {
      const cantidad = Number(control.get('cantidad')?.value) || 0;
      const precioUnitario = Number(control.get('precio_unitario')?.value) || 0;
      return total + (cantidad * precioUnitario);
    }, 0);
  });

  constructor() {
    this.ventaForm = this.fb.group({
      cliente_id: ['', Validators.required],
      almacen_id: [{ value: '', disabled: !this.authService.isAdmin() }, Validators.required],
      fecha: [new Date().toISOString().slice(0, 16), Validators.required],
      monto_pago: [null as number | null, [Validators.min(0)]],
      metodo_pago: ['efectivo', Validators.required],
      monto_gasto: [0, [Validators.min(0)]],
      detalles: this.fb.array([], [Validators.required, Validators.minLength(1)]),
    });
  }

  ngOnInit(): void {
    this.setupAlmacenListener();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.ventaId.set(+id);
      this.loadVentaData(+id);
    } else {
      this.loadFormData();
    }
  }

  setupAlmacenListener(): void {
    this.ventaForm.get('almacen_id')?.valueChanges.subscribe(almacenId => {
      if (this.canSelectAlmacen()) {
        this.loadFormData(almacenId);
      }
    });
  }

  loadFormData(almacenId?: number): void {
    this.isLoading.set(true);
    const effectiveAlmacenId = this.authService.isAdmin() ? almacenId : this.authService.currentUser()?.almacen_id;

    this.ventaService.getVentaFormData(effectiveAlmacenId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe(response => {
        this.clientes.set(response.clientes);

        if (response.almacenes) {
          this.almacenes.set(response.almacenes);
        }

        const userAlmacenId = this.authService.currentUser()?.almacen_id;
        if (!this.canSelectAlmacen() && userAlmacenId) {
          this.ventaForm.get('almacen_id')?.setValue(userAlmacenId);
        }

        const presentacionesData = response.presentaciones_disponibles ?? [];
        this.presentaciones.set(presentacionesData);
      });
  }

  loadVentaData(id: number): void {
    this.isLoading.set(true);
    this.ventaService.getVentaFormData()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe(formData => {
        this.clientes.set(formData.clientes);
        if (formData.almacenes) this.almacenes.set(formData.almacenes);
        const presentacionesData = formData.presentaciones_disponibles ?? [];
        this.presentaciones.set(presentacionesData);

        this.ventaService.getVentaById(id).subscribe(venta => {
          this.ventaForm.patchValue({
            ...venta,
            fecha: new Date(venta.fecha!).toISOString().slice(0, 16),
          });

          const detallesFormGroups = venta.detalles?.map(detalle => this.createDetalleGroup(detalle)) || [];
          this.ventaForm.setControl('detalles', this.fb.array(detallesFormGroups));
        });
      });
  }

  get detalles(): FormArray {
    return this.ventaForm.get('detalles') as FormArray;
  }

  createDetalleGroup(detalle?: any): FormGroup {
    const group = this.fb.group({
      presentacion_id: [detalle?.presentacion_id || '', Validators.required],
      nombre_presentacion: [detalle?.presentacion?.nombre || ''],
      cantidad: [detalle?.cantidad || 1, [Validators.required, Validators.min(1)]],
      precio_unitario: [detalle?.precio_unitario || 0, [Validators.required, Validators.min(0.01)]],
    });

    group.get('cantidad')?.valueChanges.subscribe(() => this.triggerTotalUpdate());
    group.get('precio_unitario')?.valueChanges.subscribe(() => this.triggerTotalUpdate());

    return group;
  }

  private triggerTotalUpdate(): void {
    this.totalUpdateTrigger.update(val => val + 1);
  }

  // ── Product Modal ────────────────────────────────────────────────────────────

  openProductModal(): void {
    this.isProductModalOpen.set(true);
  }

  closeProductModal(): void {
    this.isProductModalOpen.set(false);
  }

  onProductSelected(presentacion: PresentacionDisponible): void {
    const group = this.createDetalleGroup({
      presentacion_id: presentacion.id,
      presentacion: { nombre: presentacion.nombre },
      cantidad: 1,
      precio_unitario: Number(presentacion.precio_venta),
    });
    this.detalles.push(group);
    this.triggerTotalUpdate();
    this.isProductModalOpen.set(false);
  }

  removeDetalle(index: number): void {
    this.detalles.removeAt(index);
    this.triggerTotalUpdate();
  }

  getPresentacionNombre(presentacionId: number): string {
    const p = this.presentaciones().find(p => p.id === presentacionId);
    return p?.nombre ?? `Producto #${presentacionId}`;
  }

  // ── Voice Commands ──────────────────────────────────────────────────────────

  startVoiceDictation(): void {
    this.notificationService.showInfo('Escuchando... Habla ahora.');

    this.voiceCommandService.startListening().subscribe({
      next: (transcript) => {
        this.notificationService.showInfo('Procesando comando de voz...');
        this.voiceCommandService.sendCommand(transcript).subscribe({
          next: (response) => {
            if (response.status === 'success' && response.data) {
              this.voiceData.set(response.data);
              this.showVoiceModal.set(true);
              this.notificationService.showSuccess('Comando procesado. Verifica los datos.');
            } else {
              this.notificationService.showError('No se pudo interpretar el comando.');
            }
          },
          error: () => this.notificationService.showError('Error al procesar el comando de voz.'),
        });
      },
      error: () => this.notificationService.showError('Error en el reconocimiento de voz.'),
    });
  }

  processTextCommand(): void {
    const text = this.commandInput.value;
    if (!text?.trim()) return;

    this.notificationService.showInfo('Procesando comando de texto...');
    this.voiceCommandService.sendCommand(text).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.voiceData.set(response.data);
          this.showVoiceModal.set(true);
          this.commandInput.setValue('');
          this.notificationService.showSuccess('Comando procesado. Verifica los datos.');
        } else {
          this.notificationService.showError('No se pudo interpretar el comando.');
        }
      },
      error: () => this.notificationService.showError('Error al procesar el comando de texto.'),
    });
  }

  onVoiceConfirm(data: VoiceCommandResponse['data']): void {
    if (!data.cliente || !data.cliente.id) {
      this.notificationService.showWarning('Por favor selecciona un cliente válido en el modal.');
      return;
    }

    const invalidItems = data.items?.filter(item => !item.lote_id);
    if (invalidItems && invalidItems.length > 0) {
      this.notificationService.showError('Algunos productos no tienen lote asignado. Verifica los items marcados.');
      return;
    }

    const payload = {
      fecha: data.fecha,
      cliente: { id: data.cliente.id },
      items: data.items?.map(item => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        lote_id: item.lote_id,
      })) || [],
      pagos: data.pagos?.map(pago => ({
        monto: pago.monto,
        metodo_pago: pago.metodo_pago,
        es_deposito: pago.es_deposito || false,
      })) || [],
      gasto_asociado: data.gasto_asociado,
    };

    this.isLoading.set(true);
    this.ventaService.createVentaCompleta(payload)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.showVoiceModal.set(false);
          this.voiceData.set(null);
          this.notificationService.showSuccess('Venta registrada correctamente con comando de voz.');
          this.router.navigate(['/admin/ventas']);
        },
        error: () => this.notificationService.showError('Error al registrar la venta. Verifica los datos.'),
      });
  }

  onVoiceCancel(): void {
    this.showVoiceModal.set(false);
    this.voiceData.set(null);
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.ventaForm.invalid) {
      this.notificationService.showError('Formulario inválido. Por favor, revisa todos los campos.');
      this.ventaForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formValue = this.ventaForm.getRawValue();
    const id = this.ventaId();

    const payload: Partial<Venta> & { monto_pago?: number; metodo_pago?: string } = {
      cliente_id: Number(formValue.cliente_id),
      almacen_id: Number(formValue.almacen_id),
      fecha: new Date(formValue.fecha).toISOString(),
      monto_pago: formValue.monto_pago ? Number(formValue.monto_pago) : undefined,
      metodo_pago: formValue.metodo_pago,
      monto_gasto: formValue.monto_gasto > 0 ? Number(formValue.monto_gasto) : undefined,
      detalles: formValue.detalles.map((d: any) => ({
        presentacion_id: Number(d.presentacion_id),
        cantidad: Number(d.cantidad),
        precio_unitario: Number(d.precio_unitario),
      })),
    };

    const operation$ = id
      ? this.ventaService.updateVenta(id, payload)
      : this.ventaService.createVenta(payload as Venta);

    operation$
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(`Venta ${id ? 'actualizada' : 'creada'} correctamente.`);
          this.router.navigate(['/admin/ventas']);
        },
        error: () => {
          this.notificationService.showError(`Error al ${id ? 'actualizar' : 'crear'} la venta.`);
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/ventas']);
  }

  onClientSelected(client: Cliente | null): void {
    this.ventaForm.get('cliente_id')?.setValue(client ? client.id : '');
  }
}
