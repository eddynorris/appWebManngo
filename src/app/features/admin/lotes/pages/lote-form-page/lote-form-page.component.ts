import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { LoteService } from '../../services/lote.service';
import { Lote, Producto, Proveedor } from '../../../../../types/contract.types';
import { NotificationService } from '../../../../../shared/services/notification.service';

@Component({
  selector: 'app-lote-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lote-form-page.component.html',
  styleUrl: './lote-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoteFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly loteService = inject(LoteService);
  private readonly notificationService = inject(NotificationService);

  loteForm: FormGroup;
  isLoading = signal(false);
  isEditMode = signal(false);
  isViewMode = signal(false);
  loteId = signal<number | null>(null);

  productos = signal<Producto[]>([]);
  proveedores = signal<Proveedor[]>([]);

  constructor() {
    this.loteForm = this.fb.group({
      producto_id: ['', Validators.required],
      proveedor_id: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(255)]],
      peso_humedo_kg: ['', [Validators.required, Validators.min(0.01)]],
      peso_seco_kg: ['', [Validators.required, Validators.min(0.01)]],
      cantidad_disponible_kg: ['', [Validators.required, Validators.min(0)]],
      is_active: [true] // Por defecto los lotes se crean activos
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const isView = this.route.snapshot.url.some(segment => segment.path === 'view');
    const isEdit = this.route.snapshot.url.some(segment => segment.path === 'edit');

    if (id) {
      this.loteId.set(+id);
      this.isViewMode.set(isView);
      this.isEditMode.set(isEdit || isView);
      
      if (this.isViewMode()) {
        this.loteForm.disable();
      }
      
      this.loadFormData();
      this.loadLoteData(+id);
    } else {
      this.loadFormData();
    }
  }

  loadFormData(): void {
    this.isLoading.set(true);
    this.loteService.getFormData()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (formData) => {
          this.productos.set(formData.productos);
          this.proveedores.set(formData.proveedores);
        },
        error: (error) => {
          console.error('Error loading form data:', error);
          this.notificationService.showError('Error al cargar los datos del formulario');
        }
      });
  }

  loadLoteData(id: number): void {
    this.isLoading.set(true);
    this.loteService.getLoteById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (lote) => {
          this.loteForm.patchValue({
            producto_id: lote.producto_id,
            proveedor_id: lote.proveedor_id,
            descripcion: lote.descripcion,
            peso_humedo_kg: lote.peso_humedo_kg,
            peso_seco_kg: lote.peso_seco_kg,
            cantidad_disponible_kg: lote.cantidad_disponible_kg,
            is_active: lote.is_active
          });
        },
        error: (error) => {
          console.error('Error loading lote:', error);
          this.notificationService.showError('Error al cargar el lote');
          this.router.navigate(['/admin/lotes']);
        }
      });
  }

  onSubmit(): void {
    if (this.loteForm.invalid || this.isViewMode()) {
      if (!this.isViewMode()) {
        this.notificationService.showError('Formulario inválido. Por favor, revisa todos los campos.');
        this.loteForm.markAllAsTouched();
      }
      return;
    }

    this.isLoading.set(true);
    const formValue = this.loteForm.getRawValue();
    const id = this.loteId();

    const payload: Partial<Lote> = {
      producto_id: Number(formValue.producto_id),
      proveedor_id: Number(formValue.proveedor_id),
      descripcion: formValue.descripcion,
      peso_humedo_kg: String(formValue.peso_humedo_kg),
      peso_seco_kg: String(formValue.peso_seco_kg),
      cantidad_disponible_kg: String(formValue.cantidad_disponible_kg),
      is_active: Boolean(formValue.is_active)
    };

    const operation$ = id
      ? this.loteService.updateLote(id, payload)
      : this.loteService.createLote(payload as Lote);

    operation$
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(`Lote ${id ? 'actualizado' : 'creado'} correctamente.`);
          this.router.navigate(['/admin/lotes']);
        },
        error: (error) => {
          console.error('Error saving lote:', error);
          this.notificationService.showError(`Error al ${id ? 'actualizar' : 'crear'} el lote.`);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/lotes']);
  }

  edit(): void {
    if (this.loteId()) {
      this.router.navigate(['/admin/lotes', this.loteId(), 'edit']);
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.loteForm.get(fieldName);
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