import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { PagoService } from '../../services/pago.service';
import { VentaService } from '../../../ventas/services/venta.service';
import { Pago, Venta, VentaPendientePago, BatchPagoData } from '../../../../../types/contract.types';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-pago-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pago-form-page.component.html',
  styleUrl: './pago-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PagoFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly pagoService = inject(PagoService);
  private readonly ventaService = inject(VentaService);
  private readonly notificationService = inject(NotificationService);

  pagoForm: FormGroup;
  isLoading = signal(false);
  isEditMode = signal(false);
  pagoId = signal<number | null>(null);
  
  // Ventas pendientes de pago
  ventasPendientes = signal<VentaPendientePago[]>([]);
  metodos_pago = signal(['efectivo', 'transferencia', 'Deposito', 'yape/plin', 'tarjeta']);
  selectedFile = signal<File | null>(null);
  
  // Computed para mostrar total a pagar
  totalAPagar = computed(() => {
    return this.ventasPendientes()
      .filter(venta => venta.monto_pago && parseFloat(venta.monto_pago) > 0)
      .reduce((sum, venta) => sum + parseFloat(venta.monto_pago || '0'), 0);
  });

  constructor() {
    this.pagoForm = this.fb.group({
      fecha: [new Date().toISOString().substring(0, 10), Validators.required],
      metodo_pago: ['', Validators.required],
      referencia: [''],
    });
  }

  ngOnInit(): void {
    // Solo permitimos crear pagos por lotes, no editar
    this.loadVentasPendientes();
  }

  loadVentasPendientes(): void {
    this.isLoading.set(true);
    this.ventaService.getVentasPendientesPago()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (ventas) => {
          // Transformar las ventas a VentaPendientePago
          const ventasPendientes: VentaPendientePago[] = ventas.map(venta => {
            const total = parseFloat(venta.total || '0');
            const pagado = venta.pagos?.reduce((sum, pago) => sum + parseFloat(pago.monto || '0'), 0) || 0;
            const pendiente = total - pagado;
            
            return {
              venta_id: venta.id!,
              cliente_nombre: venta.cliente?.nombre || 'Cliente no especificado',
              fecha_venta: venta.fecha || '',
              total: venta.total || '0',
              pagado: pagado.toFixed(2),
              pendiente: pendiente.toFixed(2),
              estado_pago: venta.estado_pago || 'pendiente',
              monto_pago: '' // Inicialmente vacío para que el usuario ingrese
            };
          });
          this.ventasPendientes.set(ventasPendientes);
        },
        error: (err) => {
          this.notificationService.showError('Error al cargar las ventas pendientes.');
        }
      });
  }

  updateMontoPago(ventaId: number, monto: string): void {
    this.ventasPendientes.update(ventas => 
      ventas.map(venta => 
        venta.venta_id === ventaId 
          ? { ...venta, monto_pago: monto }
          : venta
      )
    );
  }

  onMontoChange(event: Event, ventaId: number): void {
    const target = event.target as HTMLInputElement;
    this.updateMontoPago(ventaId, target.value);
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      // Validar tipo de archivo (PDF, JPG, PNG)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        this.notificationService.showError('Solo se permiten archivos PDF, JPG y PNG');
        target.value = '';
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.showError('El archivo no debe superar los 5MB');
        target.value = '';
        return;
      }
      
      this.selectedFile.set(file);
    }
  }

  onSubmit(): void {
    if (this.pagoForm.invalid) {
      this.notificationService.showError('Por favor completa todos los campos requeridos.');
      return;
    }

    // Obtener pagos con monto > 0
    const pagosData = this.ventasPendientes()
      .filter(venta => venta.monto_pago && parseFloat(venta.monto_pago) > 0)
      .map(venta => ({
        venta_id: venta.venta_id,
        monto: venta.monto_pago!
      }));

    if (pagosData.length === 0) {
      this.notificationService.showError('Debe ingresar al menos un monto de pago.');
      return;
    }

    this.isLoading.set(true);
    const formValue = this.pagoForm.getRawValue();

    // Crear FormData para multipart
    const formData = new FormData();
    formData.append('pagos_json_data', JSON.stringify(pagosData));
    formData.append('fecha', formValue.fecha);
    formData.append('metodo_pago', formValue.metodo_pago);
    formData.append('referencia', formValue.referencia || '');
    
    // Agregar archivo si fue seleccionado
    if (this.selectedFile()) {
      formData.append('comprobante', this.selectedFile()!);
    }

    this.pagoService.createBatchPagos(formData)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Pagos registrados correctamente.');
          this.router.navigate(['/admin/pagos']);
        },
        error: (err) => {
          this.notificationService.showError('Error al registrar los pagos.');
          console.error('Error:', err);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/pagos']);
  }
}
