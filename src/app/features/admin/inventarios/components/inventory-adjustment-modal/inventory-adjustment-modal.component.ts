import { ChangeDetectionStrategy, Component, input, output, signal, inject, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { Inventario, Lote } from '../../../../../types/contract.types';
import { LoteService } from '../../../reportes/services/lote.service';
import { NotificationService } from '../../../../../shared/services/notification.service';

@Component({
  selector: 'app-inventory-adjustment-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent
  ],
  templateUrl: './inventory-adjustment-modal.component.html',
  styleUrl: './inventory-adjustment-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryAdjustmentModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly loteService = inject(LoteService);
  private readonly notificationService = inject(NotificationService);

  // Inputs
  isOpen = input.required<boolean>();
  inventario = input.required<Inventario | null>();

  // Outputs
  close = output<void>();
  save = output<{
    cantidad: number;
    motivo: string;
    lote_id?: number;
    adjustmentType?: 'add' | 'subtract';
  }>();

  // State
  lotes = signal<Lote[]>([]);
  adjustmentType = signal<'add' | 'subtract'>('add');
  cantidadValue = signal<number>(1);

  // Form
  form = this.fb.group({
    cantidad: [1, [Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/)]],
    motivo: ['', [Validators.required, Validators.minLength(3)]],
    lote_id: [null as number | null]
  });

  // Computed values
  modalTitle = computed(() => {
    const type = this.adjustmentType();
    const producto = this.inventario()?.presentacion?.nombre || 'producto';
    return type === 'add' 
      ? `Agregar inventario - ${producto}`
      : `Quitar inventario - ${producto}`;
  });

  currentStock = computed(() => this.inventario()?.cantidad || 0);

  finalQuantity = computed(() => {
    const current = this.currentStock();
    const adjustment = this.cantidadValue();
    const type = this.adjustmentType();
    
    const result = type === 'add' ? current + adjustment : current - adjustment;
    return Math.round(result); // Ensure integer result
  });

  ngOnInit(): void {
    this.loadLotes();
    
    // Subscribe to cantidad changes to update the signal
    this.form.get('cantidad')?.valueChanges.subscribe(value => {
      const numValue = parseInt(value?.toString() || '1', 10);
      this.cantidadValue.set(isNaN(numValue) ? 1 : numValue);
    });
  }

  loadLotes(): void {
    this.loteService.getLotes().subscribe({
      next: (response: any) => {
        // Handle both paginated and direct array responses
        const data = Array.isArray(response) ? response : response.data || [];
        this.lotes.set(data);
      },
      error: () => {
        this.notificationService.showError('Error al cargar los lotes.');
      }
    });
  }

  setAdjustmentType(type: 'add' | 'subtract'): void {
    this.adjustmentType.set(type);
    // Reset form when changing type
    this.form.patchValue({
      cantidad: 1,
      motivo: '',
      lote_id: null
    });
    
    // Reset cantidad signal
    this.cantidadValue.set(1);
    
    // Always set lote_id to null when subtracting since the field is hidden
    if (type === 'subtract') {
      this.form.get('lote_id')?.setValue(null);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const current = this.currentStock();
    // Ensure adjustment is parsed as integer
    const adjustment = parseInt(formValue.cantidad!.toString(), 10);
    const type = this.adjustmentType();

    // Validate that adjustment is a valid positive integer
    if (isNaN(adjustment) || adjustment <= 0) {
      this.notificationService.showError('La cantidad debe ser un número entero positivo.');
      return;
    }

    // Calculate final quantity based on adjustment type
    const finalQuantity = type === 'add' ? current + adjustment : current - adjustment;

    // Validate that we don't go negative
    if (finalQuantity < 0) {
      this.notificationService.showError('La cantidad final no puede ser negativa.');
      return;
    }

    // Prepare the save data - send adjustment amount, not final quantity
    const saveData: {
      cantidad: number;
      motivo: string;
      lote_id?: number;
      adjustmentType?: 'add' | 'subtract';
    } = {
      cantidad: adjustment, // Send the adjustment amount
      motivo: formValue.motivo!,
      adjustmentType: type // Include the adjustment type
    };

    // Only include lote_id when adding inventory
    if (type === 'add' && formValue.lote_id) {
      saveData.lote_id = formValue.lote_id;
    }

    this.save.emit(saveData);
  }

  onClose(): void {
    this.form.reset();
    this.adjustmentType.set('add');
    this.cantidadValue.set(1);
    this.close.emit();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors?.['required']) {
      return 'Este campo es requerido';
    }
    if (field?.errors?.['min']) {
      return 'La cantidad debe ser mayor a 0';
    }
    if (field?.errors?.['pattern']) {
      return 'La cantidad debe ser un número entero positivo';
    }
    if (field?.errors?.['minlength']) {
      return 'Mínimo 3 caracteres';
    }
    return '';
  }
}