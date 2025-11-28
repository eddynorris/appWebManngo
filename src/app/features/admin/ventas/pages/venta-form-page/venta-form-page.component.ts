import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash, faTimesCircle, faMicrophone, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

import { VentaService } from '../../services/venta.service';
import { GastoService } from '../../../gastos/services/gasto.service';
import { Venta, Cliente, Almacen, PresentacionConStockLocal, PresentacionConStockGlobal, PresentacionDisponible } from '../../../../../types/contract.types';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { ClientSelectComponent } from '../../../../../shared/components/client-select/client-select.component';
import { VoiceCommandService, VoiceCommandResponse } from '../../../../../core/services/voice-command.service';
import { VoiceResultModalComponent } from '../../components/voice-result-modal/voice-result-modal.component';

// Tipo unificado para las presentaciones en el formulario
type PresentacionParaVenta = PresentacionDisponible | (PresentacionConStockLocal & { stock_por_almacen?: never }) | (PresentacionConStockGlobal & { stock_disponible?: never });

@Component({
  selector: 'app-venta-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule, ClientSelectComponent, VoiceResultModalComponent],
  templateUrl: './venta-form-page.component.html',
  styleUrl: './venta-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VentaFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly ventaService = inject(VentaService);
  private readonly gastoService = inject(GastoService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  readonly voiceCommandService = inject(VoiceCommandService);

  // FontAwesome icons
  faTrash = faTrash;
  faTimesCircle = faTimesCircle;
  faMicrophone = faMicrophone;
  faPaperPlane = faPaperPlane;

  commandInput = new FormControl('');

  ventaForm: FormGroup;
  isLoading = signal(false);
  isEditMode = signal(false);
  ventaId = signal<number | null>(null);

  clientes = signal<Cliente[]>([]);
  almacenes = signal<Almacen[]>([]);
  presentaciones = signal<PresentacionParaVenta[]>([]);

  // Voice modal state
  showVoiceModal = signal(false);
  voiceData = signal<VoiceCommandResponse['data'] | null>(null);

  // Para saber si el admin puede elegir almacén
  canSelectAlmacen = computed(() => this.authService.isAdmin() && this.almacenes().length > 0);

  // Signal para forzar la reactividad del total
  private totalUpdateTrigger = signal(0);

  // Computed para calcular el total de la venta
  ventaTotal = computed(() => {
    // Incluir el trigger para forzar recálculo
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
      tipo_pago: ['contado', Validators.required],
      estado_pago: ['pendiente', Validators.required],
      consumo_diario_kg: ['0.00', Validators.required],
      gasto_monto: [null as number | null, [Validators.min(0.01)]],
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
      this.addDetalle();
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
    // Para usuarios no-admin, siempre pasamos su ID de almacén
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

        const presentacionesData = response.presentaciones_disponibles || response.presentaciones_con_stock_global || response.presentaciones_con_stock_local || [];
        this.presentaciones.set(presentacionesData);
      });
  }

  loadVentaData(id: number): void {
    this.isLoading.set(true);
    // En modo edición, cargamos primero los datos del formulario (clientes, etc.)
    // y luego los datos de la venta específica.
    this.ventaService.getVentaFormData()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe(formData => {
        this.clientes.set(formData.clientes);
        if (formData.almacenes) this.almacenes.set(formData.almacenes);
        const presentacionesData = formData.presentaciones_disponibles || formData.presentaciones_con_stock_global || formData.presentaciones_con_stock_local || [];
        this.presentaciones.set(presentacionesData);

        // Ahora cargamos la venta y parchamos el formulario
        this.ventaService.getVentaById(id).subscribe(venta => {
          this.ventaForm.patchValue({
            ...venta,
            fecha: new Date(venta.fecha!).toISOString().slice(0, 16)
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
      cantidad: [detalle?.cantidad || 1, [Validators.required, Validators.min(1)]],
      precio_unitario: [detalle?.precio_unitario || 0, [Validators.required, Validators.min(0.01)]],
    });

    // Listen to presentacion_id changes to auto-populate precio_unitario
    group.get('presentacion_id')?.valueChanges.subscribe(presentacionId => {
      if (presentacionId) {
        const presentacion = this.presentaciones().find(p => p.id === Number(presentacionId));
        if (presentacion && presentacion.precio_venta) {
          group.get('precio_unitario')?.setValue(Number(presentacion.precio_venta));
        }
      }
      this.triggerTotalUpdate();
    });

    // Listen to cantidad and precio_unitario changes to update total
    group.get('cantidad')?.valueChanges.subscribe(() => this.triggerTotalUpdate());
    group.get('precio_unitario')?.valueChanges.subscribe(() => this.triggerTotalUpdate());

    return group;
  }

  private triggerTotalUpdate(): void {
    this.totalUpdateTrigger.update(val => val + 1);
  }

  addDetalle(): void {
    this.detalles.push(this.createDetalleGroup());
  }

  removeDetalle(index: number): void {
    this.detalles.removeAt(index);
    this.triggerTotalUpdate();
  }

  // ========== VOICE COMMAND METHODS ==========

  startVoiceDictation(): void {
    this.notificationService.showInfo('Escuchando... Habla ahora.');

    this.voiceCommandService.startListening().subscribe({
      next: (transcript) => {
        console.log('Transcript received:', transcript);
        this.notificationService.showInfo('Procesando comando de voz...');

        // Send transcript to backend
        this.voiceCommandService.sendCommand(transcript).subscribe({
          next: (response) => {
            console.log('Voice command response:', response);
            if (response.status === 'success' && response.data) {
              this.voiceData.set(response.data);
              this.showVoiceModal.set(true);
              this.notificationService.showSuccess('Comando procesado. Verifica los datos.');
            } else {
              this.notificationService.showError('No se pudo interpretar el comando.');
            }
          },
          error: (err) => {
            console.error('Error sending voice command:', err);
            this.notificationService.showError('Error al procesar el comando de voz.');
          }
        });
      },
      error: (err) => {
        console.error('Voice recognition error:', err);
        this.notificationService.showError('Error en el reconocimiento de voz.');
      }
    });
  }

  processTextCommand(): void {
    const text = this.commandInput.value;
    if (!text?.trim()) return;

    this.notificationService.showInfo('Procesando comando de texto...');

    this.voiceCommandService.sendCommand(text).subscribe({
      next: (response) => {
        console.log('Text command response:', response);
        if (response.status === 'success' && response.data) {
          this.voiceData.set(response.data);
          this.showVoiceModal.set(true);
          this.commandInput.setValue(''); // Clear input
          this.notificationService.showSuccess('Comando procesado. Verifica los datos.');
        } else {
          this.notificationService.showError('No se pudo interpretar el comando.');
        }
      },
      error: (err) => {
        console.error('Error sending text command:', err);
        this.notificationService.showError('Error al procesar el comando de texto.');
      }
    });
  }

  onVoiceConfirm(data: VoiceCommandResponse['data']): void {
    console.log('Voice data confirmed, submitting directly:', data);

    // 1. Validate Client
    if (!data.cliente || !data.cliente.id) {
      this.notificationService.showWarning("Por favor selecciona un cliente válido en el modal.");
      return;
    }

    // 2. Validate Items (Check for lote_id)
    const invalidItems = data.items?.filter(item => !item.lote_id);
    if (invalidItems && invalidItems.length > 0) {
      this.notificationService.showError("Algunos productos no tienen lote asignado (stock insuficiente). Verifica los items marcados.");
      return;
    }

    // 3. Prepare Payload
    const payload = {
      cliente: {
        id: data.cliente.id
      },
      items: data.items?.map(item => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        lote_id: item.lote_id
      })) || [],
      pagos: data.pagos?.map(pago => ({
        monto: pago.monto,
        metodo_pago: pago.metodo_pago,
        es_deposito: pago.es_deposito || false
      })) || [],
      gasto_asociado: data.gasto_asociado // Optional
    };

    // 4. Send Request
    this.isLoading.set(true);
    this.ventaService.createVentaCompleta(payload)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.showVoiceModal.set(false);
          this.voiceData.set(null);
          this.notificationService.showSuccess('Venta registrada correctamente con comando de voz.');
          this.router.navigate(['/admin/ventas']);
        },
        error: (err) => {
          console.error('Error creating transaction:', err);
          this.notificationService.showError('Error al registrar la venta. Verifica los datos.');
        }
      });
  }

  onVoiceCancel(): void {
    this.showVoiceModal.set(false);
    this.voiceData.set(null);
  }

  // ========== END VOICE COMMAND METHODS ==========

  onSubmit(): void {
    if (this.ventaForm.invalid) {
      this.notificationService.showError('Formulario inválido. Por favor, revisa todos los campos.');
      this.ventaForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formValue = this.ventaForm.getRawValue();
    const id = this.ventaId();

    const payload: Partial<Venta> = {
      ...formValue,
      cliente_id: Number(formValue.cliente_id),
      almacen_id: Number(formValue.almacen_id),
      fecha: new Date(formValue.fecha).toISOString(),
      consumo_diario_kg: String(formValue.consumo_diario_kg || '0.00'),
      detalles: formValue.detalles.map((d: any) => ({
        ...d,
        presentacion_id: Number(d.presentacion_id),
        cantidad: Number(d.cantidad),
        precio_unitario: String(d.precio_unitario)
      }))
    };

    const operation$ = id
      ? this.ventaService.updateVenta(id, payload)
      : this.ventaService.createVenta(payload as Venta);

    operation$
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(`Venta ${id ? 'actualizada' : 'creada'} correctamente.`);
          const gastoMonto = formValue.gasto_monto;
          const agregarGasto = gastoMonto !== null && gastoMonto !== '' && Number(gastoMonto) > 0;
          if (agregarGasto) {
            const cliente = this.clientes().find(c => c.id === Number(formValue.cliente_id));
            const descripcion = `Transporte por envio al cliente ${cliente?.nombre ?? ''}`;
            const gastoPayload = {
              descripcion,
              monto: String(gastoMonto),
              fecha: new Date(formValue.fecha).toISOString().substring(0, 10),
              categoria: 'logistica',
              almacen_id: Number(formValue.almacen_id),
              lote_id: null,
            };
            this.gastoService.createGasto(gastoPayload).subscribe({
              next: () => {
                this.notificationService.showSuccess('Gasto registrado correctamente.');
                this.router.navigate(['/admin/ventas']);
              },
              error: () => {
                this.notificationService.showError('Error al registrar el gasto.');
                this.router.navigate(['/admin/ventas']);
              }
            });
          } else {
            this.router.navigate(['/admin/ventas']);
          }
        },
        error: (err) => {
          this.notificationService.showError(`Error al ${id ? 'actualizar' : 'crear'} la venta.`);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/ventas']);
  }

  onClientSelected(client: Cliente | null): void {
    if (client) {
      this.ventaForm.get('cliente_id')?.setValue(client.id);
    } else {
      this.ventaForm.get('cliente_id')?.setValue('');
    }
  }
}
