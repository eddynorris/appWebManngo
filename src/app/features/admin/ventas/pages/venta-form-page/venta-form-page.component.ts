import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

import { VentaService } from '../../services/venta.service';
import { Venta, Cliente, Almacen, PresentacionConStockLocal, PresentacionConStockGlobal, PresentacionDisponible } from '../../../../../types/contract.types';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { AuthService } from '../../../../../core/services/auth.service';

// Tipo unificado para las presentaciones en el formulario
type PresentacionParaVenta = PresentacionDisponible | (PresentacionConStockLocal & { stock_por_almacen?: never }) | (PresentacionConStockGlobal & { stock_disponible?: never });

@Component({
  selector: 'app-venta-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
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

  // FontAwesome icons
  faTrash = faTrash;
  faTimesCircle = faTimesCircle;

  ventaForm: FormGroup;
  isLoading = signal(false);
  isEditMode = signal(false);
  ventaId = signal<number | null>(null);

  clientes = signal<Cliente[]>([]);
  almacenes = signal<Almacen[]>([]);
  presentaciones = signal<PresentacionParaVenta[]>([]);

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
      fecha: [new Date().toISOString().substring(0, 16), Validators.required],
      tipo_pago: ['contado', Validators.required],
      estado_pago: ['pendiente', Validators.required],
      consumo_diario_kg: ['0.00', Validators.required],
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

        if(response.almacenes) {
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
        if(formData.almacenes) this.almacenes.set(formData.almacenes);
        const presentacionesData = formData.presentaciones_disponibles || formData.presentaciones_con_stock_global || formData.presentaciones_con_stock_local || [];
        this.presentaciones.set(presentacionesData);

        // Ahora cargamos la venta y parchamos el formulario
        this.ventaService.getVentaById(id).subscribe(venta => {
          this.ventaForm.patchValue({
            ...venta,
            fecha: new Date(venta.fecha!).toISOString().substring(0, 10)
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
          this.router.navigate(['/admin/ventas']);
        },
        error: (err) => {
          this.notificationService.showError(`Error al ${id ? 'actualizar' : 'crear'} la venta.`);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/ventas']);
  }
}
