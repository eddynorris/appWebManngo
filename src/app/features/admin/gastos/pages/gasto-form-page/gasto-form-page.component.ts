import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { GastoService } from '../../services/gasto.service';
import { AlmacenService } from '../../../almacenes/services/almacen.service';
import { Gasto, Almacen } from '../../../../../types/contract.types';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-gasto-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gasto-form-page.component.html',
  styleUrl: './gasto-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GastoFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly gastoService = inject(GastoService);
  private readonly almacenService = inject(AlmacenService);
  private readonly notificationService = inject(NotificationService);

  gastoForm: FormGroup;
  isLoading = signal(false);
  isEditMode = signal(false);
  gastoId = signal<number | null>(null);

  almacenes = signal<Almacen[]>([]);
  // TODO: Fetch categories from an endpoint
  categorias = signal(['logistica', 'personal', 'otros']);

  constructor() {
    this.gastoForm = this.fb.group({
      descripcion: ['', Validators.required],
      monto: ['', [Validators.required, Validators.min(0.01)]],
      fecha: [new Date().toISOString().substring(0, 10), Validators.required],
      categoria: ['', Validators.required],
      almacen_id: [null as number | null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadAlmacenes();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.gastoId.set(+id);
      this.loadGastoData(+id);
    }
  }

  loadAlmacenes(): void {
    this.almacenService.getAlmacenes().subscribe(data => this.almacenes.set(data));
  }

  loadGastoData(id: number): void {
    this.isLoading.set(true);
    this.gastoService.getGastoById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe(gasto => {
        this.gastoForm.patchValue({
          ...gasto,
          fecha: new Date(gasto.fecha!).toISOString().substring(0, 10),
        });
      });
  }

  onSubmit(): void {
    if (this.gastoForm.invalid) {
      this.notificationService.showError('Formulario inválido. Revisa los campos.');
      return;
    }

    this.isLoading.set(true);
    const formValue = this.gastoForm.getRawValue();
    const id = this.gastoId();

    const payload: Partial<Gasto> = {
      ...formValue,
      almacen_id: Number(formValue.almacen_id),
      monto: String(formValue.monto)
    };

    const operation$ = id
      ? this.gastoService.updateGasto(id, payload)
      : this.gastoService.createGasto(payload as Gasto);

    operation$
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(`Gasto ${id ? 'actualizado' : 'creado'} correctamente.`);
          this.router.navigate(['/admin/gastos']);
        },
        error: (err) => {
          this.notificationService.showError(`Error al ${id ? 'actualizar' : 'crear'} el gasto.`);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/gastos']);
  }
}
