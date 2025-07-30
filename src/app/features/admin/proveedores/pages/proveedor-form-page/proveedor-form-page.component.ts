import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { ProveedorService } from '../../services/proveedor.service';
import { Proveedor } from '../../../../../types/contract.types';
import { NotificationService } from '../../../../../shared/services/notification.service';

@Component({
  selector: 'app-proveedor-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './proveedor-form-page.component.html',
  styleUrl: './proveedor-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProveedorFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly proveedorService = inject(ProveedorService);
  private readonly notificationService = inject(NotificationService);

  proveedorForm: FormGroup;
  isLoading = signal(false);
  isEditMode = signal(false);
  isViewMode = signal(false);
  proveedorId = signal<number | null>(null);

  constructor() {
    this.proveedorForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      telefono: ['', [Validators.maxLength(20)]],
      direccion: ['', [Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const isView = this.route.snapshot.url.some(segment => segment.path === 'view');
    const isEdit = this.route.snapshot.url.some(segment => segment.path === 'edit');

    if (id) {
      this.proveedorId.set(+id);
      this.isViewMode.set(isView);
      this.isEditMode.set(isEdit || isView);
      
      if (this.isViewMode()) {
        this.proveedorForm.disable();
      }
      
      this.loadProveedorData(+id);
    }
  }

  loadProveedorData(id: number): void {
    this.isLoading.set(true);
    this.proveedorService.getProveedorById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (proveedor) => {
          this.proveedorForm.patchValue({
            nombre: proveedor.nombre,
            telefono: proveedor.telefono,
            direccion: proveedor.direccion
          });
        },
        error: (error) => {
          console.error('Error loading proveedor:', error);
          this.notificationService.showError('Error al cargar el proveedor');
          this.router.navigate(['/admin/proveedores']);
        }
      });
  }

  onSubmit(): void {
    if (this.proveedorForm.invalid || this.isViewMode()) {
      if (!this.isViewMode()) {
        this.notificationService.showError('Formulario inválido. Por favor, revisa todos los campos.');
        this.proveedorForm.markAllAsTouched();
      }
      return;
    }

    this.isLoading.set(true);
    const formValue = this.proveedorForm.getRawValue();
    const id = this.proveedorId();

    const payload: Partial<Proveedor> = {
      nombre: formValue.nombre,
      telefono: formValue.telefono || null,
      direccion: formValue.direccion || null
    };

    const operation$ = id
      ? this.proveedorService.updateProveedor(id, payload)
      : this.proveedorService.createProveedor(payload as Proveedor);

    operation$
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(`Proveedor ${id ? 'actualizado' : 'creado'} correctamente.`);
          this.router.navigate(['/admin/proveedores']);
        },
        error: (error) => {
          console.error('Error saving proveedor:', error);
          this.notificationService.showError(`Error al ${id ? 'actualizar' : 'crear'} el proveedor.`);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/proveedores']);
  }

  edit(): void {
    if (this.proveedorId()) {
      this.router.navigate(['/admin/proveedores', this.proveedorId(), 'edit']);
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.proveedorForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors?.['maxlength']) {
        return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }
}