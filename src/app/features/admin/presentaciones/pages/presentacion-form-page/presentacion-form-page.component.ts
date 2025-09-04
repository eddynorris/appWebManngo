import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { PresentacionService } from '../../services/presentacion.service';
import { PresentacionProducto, Producto, Almacen } from '../../../../../types/contract.types';
import { NotificationService } from '../../../../../shared/services/notification.service';

@Component({
  selector: 'app-presentacion-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './presentacion-form-page.component.html',
  styleUrl: './presentacion-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PresentacionFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly presentacionService = inject(PresentacionService);
  private readonly notificationService = inject(NotificationService);

  presentacionForm: FormGroup;
  isLoading = signal(false);
  isEditMode = signal(false);
  isViewMode = signal(false);
  presentacionId = signal<number | null>(null);

  productos = signal<Producto[]>([]);
  almacenes = signal<Almacen[]>([]);

  // Opciones para tipos de presentación
  tiposDisponibles = [
    { value: 'bruto', label: 'Bruto' },
    { value: 'procesado', label: 'Procesado' },
    { value: 'merma', label: 'Merma' },
    { value: 'briqueta', label: 'Briqueta' },
    { value: 'detalle', label: 'Detalle' },
    { value: 'insumo', label: 'Insumo' }
  ];

  constructor() {
    this.presentacionForm = this.fb.group({
      producto_id: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      capacidad_kg: ['', [Validators.required, Validators.min(0.01)]],
      tipo: ['', Validators.required],
      precio_venta: ['', [Validators.required, Validators.min(0.01)]],
      activo: [true],
      url_foto: ['', Validators.maxLength(255)],
      almacen_id: [''] // Campo opcional para almacén específico
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const isView = this.route.snapshot.url.some(segment => segment.path === 'view');
    const isEdit = this.route.snapshot.url.some(segment => segment.path === 'edit');

    if (id) {
      this.presentacionId.set(+id);
      this.isViewMode.set(isView);
      this.isEditMode.set(isEdit || isView);
      
      if (this.isViewMode()) {
        this.presentacionForm.disable();
      }
      
      this.loadFormData();
      this.loadPresentacionData(+id);
    } else {
      this.loadFormData();
    }
  }

  loadFormData(): void {
    this.isLoading.set(true);
    this.presentacionService.getFormData()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (formData) => {
          this.productos.set(formData.productos);
          this.almacenes.set(formData.almacenes);
        },
        error: (error) => {
          console.error('Error loading form data:', error);
          this.notificationService.showError('Error al cargar los datos del formulario');
        }
      });
  }

  loadPresentacionData(id: number): void {
    this.isLoading.set(true);
    this.presentacionService.getPresentacionById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (presentacion) => {
          this.presentacionForm.patchValue({
            producto_id: presentacion.producto_id,
            nombre: presentacion.nombre,
            capacidad_kg: presentacion.capacidad_kg,
            tipo: presentacion.tipo,
            precio_venta: presentacion.precio_venta,
            activo: presentacion.activo,
            url_foto: presentacion.url_foto,
            almacen_id: '' // No se incluye almacen_id en edición
          });
        },
        error: (error) => {
          console.error('Error loading presentacion:', error);
          this.notificationService.showError('Error al cargar la presentación');
          this.router.navigate(['/admin/presentaciones']);
        }
      });
  }

  onSubmit(): void {
    if (this.presentacionForm.invalid || this.isViewMode()) {
      if (!this.isViewMode()) {
        this.notificationService.showError('Formulario inválido. Por favor, revisa todos los campos.');
        this.presentacionForm.markAllAsTouched();
      }
      return;
    }

    this.isLoading.set(true);
    const formValue = this.presentacionForm.getRawValue();
    const id = this.presentacionId();

    const payload: Partial<PresentacionProducto> = {
      producto_id: Number(formValue.producto_id),
      nombre: formValue.nombre,
      capacidad_kg: String(formValue.capacidad_kg),
      tipo: formValue.tipo,
      precio_venta: String(formValue.precio_venta),
      activo: formValue.activo,
      url_foto: formValue.url_foto || null
    };

    const almacenId = formValue.almacen_id ? Number(formValue.almacen_id) : undefined;

    const operation$ = id
      ? this.presentacionService.updatePresentacion(id, payload)
      : this.presentacionService.createPresentacion(payload as PresentacionProducto, almacenId);

    operation$
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(`Presentación ${id ? 'actualizada' : 'creada'} correctamente.`);
          this.router.navigate(['/admin/presentaciones']);
        },
        error: (error) => {
          console.error('Error saving presentacion:', error);
          this.notificationService.showError(`Error al ${id ? 'actualizar' : 'crear'} la presentación.`);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/presentaciones']);
  }

  edit(): void {
    if (this.presentacionId()) {
      this.router.navigate(['/admin/presentaciones', this.presentacionId(), 'edit']);
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.presentacionForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors?.['min']) {
        return `El valor mínimo es ${field.errors['min'].min}`;
      }
      if (field.errors?.['maxlength']) {
        return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }
}