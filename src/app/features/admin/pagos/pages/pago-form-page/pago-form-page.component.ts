import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { PagoService } from '../../services/pago.service';
// We might need VentaService to get a list of sales to choose from
// import { VentaService } from '../../ventas/services/venta.service';
import { Pago, Venta } from '../../../../../types/contract.types';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-pago-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './pago-form-page.component.html',
  styleUrl: './pago-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PagoFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly pagoService = inject(PagoService);
  private readonly notificationService = inject(NotificationService);
  // private readonly ventaService = inject(VentaService);

  pagoForm: FormGroup;
  isLoading = signal(false);
  isEditMode = signal(false);
  pagoId = signal<number | null>(null);

  // TODO: Fetch sales with pending payments
  ventas = signal<Venta[]>([]);
  metodos_pago = signal(['efectivo', 'transferencia', 'yape', 'plin', 'tarjeta']);

  constructor() {
    this.pagoForm = this.fb.group({
      venta_id: [null as number | null, Validators.required],
      monto: ['', [Validators.required, Validators.min(0.01)]],
      fecha: [new Date().toISOString().substring(0, 10), Validators.required],
      metodo_pago: ['', Validators.required],
      referencia: [''],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.pagoId.set(+id);
      this.loadPagoData(+id);
    }
  }

  loadPagoData(id: number): void {
    this.isLoading.set(true);
    this.pagoService.getPagoById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe(pago => {
        this.pagoForm.patchValue({
          ...pago,
          fecha: new Date(pago.fecha!).toISOString().substring(0, 10),
        });
      });
  }

  onSubmit(): void {
    if (this.pagoForm.invalid) {
      this.notificationService.showError('Formulario inválido.');
      return;
    }

    this.isLoading.set(true);
    const formValue = this.pagoForm.getRawValue();
    const id = this.pagoId();

    const payload: Partial<Pago> = {
      ...formValue,
      venta_id: Number(formValue.venta_id),
      monto: String(formValue.monto)
    };

    const operation$ = id
      ? this.pagoService.updatePago(id, payload)
      : this.pagoService.createPago(payload as Pago);

    operation$
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(`Pago ${id ? 'actualizado' : 'creado'} correctamente.`);
          this.router.navigate(['/admin/pagos']);
        },
        error: (err) => {
          this.notificationService.showError(`Error al ${id ? 'actualizar' : 'crear'} el pago.`);
          console.error(err);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/pagos']);
  }
}
