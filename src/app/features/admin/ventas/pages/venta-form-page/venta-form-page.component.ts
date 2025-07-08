import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { VentaService } from '../../services/venta.service';
import { ClienteService } from '../../../clientes/services/cliente.service';
import { ProductService } from '../../../productos/services/product.service';

import { Venta, Cliente, PresentacionProducto } from '../../../../../types/contract.types';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-venta-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './venta-form-page.component.html',
  styleUrl: './venta-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VentaFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly ventaService = inject(VentaService);
  private readonly clienteService = inject(ClienteService);
  private readonly productService = inject(ProductService);
  private readonly notificationService = inject(NotificationService);

  ventaForm: FormGroup;
  isLoading = signal(false);
  isEditMode = signal(false);
  ventaId = signal<number | null>(null);

  clientes = signal<Cliente[]>([]);
  presentaciones = signal<PresentacionProducto[]>([]);

  constructor() {
    this.ventaForm = this.fb.group({
      cliente_id: ['', Validators.required],
      almacen_id: [1, Validators.required], // TODO: Make this dynamic
      fecha: [new Date().toISOString().substring(0, 10), Validators.required],
      tipo_pago: ['contado', Validators.required],
      estado_pago: ['pagado', Validators.required],
      detalles: this.fb.array([], Validators.required),
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.ventaId.set(+id);
      this.loadVentaData(+id);
    } else {
      // Add one empty detail row by default for new sales
      this.addDetalle();
    }
  }

  loadInitialData(): void {
    // TODO: These should be paginated if the lists are long
    this.clienteService.getClientes().subscribe(response => this.clientes.set(response.data));
    this.productService.getAllPresentaciones().subscribe(response => this.presentaciones.set(response));
  }

  loadVentaData(id: number): void {
    this.isLoading.set(true);
    this.ventaService.getVentaById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe(venta => {
        this.ventaForm.patchValue({
          ...venta,
          fecha: new Date(venta.fecha!).toISOString().substring(0, 10)
        });

        const detallesFormGroups = venta.detalles?.map(detalle => this.createDetalleGroup(detalle)) || [];
        this.ventaForm.setControl('detalles', this.fb.array(detallesFormGroups));
      });
  }

  get detalles(): FormArray {
    return this.ventaForm.get('detalles') as FormArray;
  }

  createDetalleGroup(detalle?: any): FormGroup {
    return this.fb.group({
      presentacion_id: [detalle?.presentacion_id || '', Validators.required],
      cantidad: [detalle?.cantidad || 1, [Validators.required, Validators.min(1)]],
      precio_unitario: [detalle?.precio_unitario || 0, Validators.required],
    });
  }

  addDetalle(): void {
    this.detalles.push(this.createDetalleGroup());
  }

  removeDetalle(index: number): void {
    this.detalles.removeAt(index);
  }

  onSubmit(): void {
    if (this.ventaForm.invalid) {
      this.notificationService.showError('Formulario inválido. Por favor, revisa todos los campos.');
      // Mark all fields as touched to display errors
      this.ventaForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formValue = this.ventaForm.getRawValue();
    const id = this.ventaId();

    // El backend espera números, nos aseguramos de que lo sean
    const payload: Partial<Venta> = {
      ...formValue,
      cliente_id: Number(formValue.cliente_id),
      almacen_id: Number(formValue.almacen_id),
      detalles: formValue.detalles.map((d: any) => ({
        ...d,
        presentacion_id: Number(d.presentacion_id),
        cantidad: Number(d.cantidad),
        precio_unitario: String(d.precio_unitario) // El contrato lo define como string
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
          console.error(err);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/ventas']);
  }
}
