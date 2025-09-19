import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faTrash, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';

import { InventarioService, TransferenciasData, Almacen, PresentacionDisponible, TransferenciaRequest } from '../../services/inventario.service';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { LoadingService } from '../../../../../shared/services/loading.service';

@Component({
  selector: 'app-transferencias-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
  ],
  templateUrl: './transferencias-page.component.html',
  styleUrl: './transferencias-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TransferenciasPageComponent implements OnInit {
  private readonly inventarioService = inject(InventarioService);
  private readonly notificationService = inject(NotificationService);
  readonly loadingService = inject(LoadingService);
  private readonly fb = inject(FormBuilder);

  // FontAwesome icons
  faPlus = faPlus;
  faTrash = faTrash;
  faExchangeAlt = faExchangeAlt;

  // State
  transferenciasData = signal<TransferenciasData | null>(null);
  almacenes = signal<Almacen[]>([]);
  presentacionesDisponibles = signal<PresentacionDisponible[]>([]);
  
  // Método para obtener almacenes de destino (excluyendo el origen seleccionado)
  getAlmacenesDestino() {
    const almacenesDisponibles = this.almacenes();
    const almacenOrigenId = this.transferenciasForm.get('almacen_origen_id')?.value;
    
    if (!almacenOrigenId) {
      return almacenesDisponibles;
    }
    
    return almacenesDisponibles.filter(almacen => almacen.id !== +almacenOrigenId);
  }

  // Método para limpiar el almacén destino cuando cambia el origen
  onAlmacenOrigenChange() {
    const almacenDestinoControl = this.transferenciasForm.get('almacen_destino_id');
    const almacenOrigenId = this.transferenciasForm.get('almacen_origen_id')?.value;
    const almacenDestinoId = almacenDestinoControl?.value;
    
    // Si el almacén destino es igual al origen, limpiarlo
    if (almacenDestinoId && almacenOrigenId && +almacenDestinoId === +almacenOrigenId) {
      almacenDestinoControl?.setValue('');
    }
    
    // Reset transferencias when origin warehouse changes
    this.transferenciasArray.clear();
  }

  // Form
  transferenciasForm: FormGroup;

  constructor() {
    this.transferenciasForm = this.fb.group({
      almacen_origen_id: ['', Validators.required],
      almacen_destino_id: ['', Validators.required],
      transferencias: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadTransferenciasData();
  }

  get transferenciasArray(): FormArray {
    return this.transferenciasForm.get('transferencias') as FormArray;
  }

  loadTransferenciasData(): void {
    this.loadingService.startLoading();
    this.inventarioService.getTransferenciasData().subscribe({
      next: (data) => {
        this.transferenciasData.set(data);
        this.almacenes.set(data.almacenes);
        this.presentacionesDisponibles.set(data.presentaciones_disponibles);
        this.loadingService.stopLoading();
      },
      error: (error) => {
        console.error('Error loading transferencias data:', error);
        this.notificationService.showError('Error al cargar los datos de transferencias');
        this.loadingService.stopLoading();
      }
    });
  }

  onAlmacenDestinoChange(): void {
    // Reset transferencias when destination warehouse changes
    this.transferenciasArray.clear();
  }

  addTransferencia(): void {
    const transferenciaGroup = this.fb.group({
      presentacion_id: ['', Validators.required],
      lote_id: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(0.01)]],
      stock_disponible: [{ value: 0, disabled: true }]
    });

    this.transferenciasArray.push(transferenciaGroup);
  }

  removeTransferencia(index: number): void {
    this.transferenciasArray.removeAt(index);
  }

  onPresentacionChange(index: number): void {
    const transferenciaGroup = this.transferenciasArray.at(index);
    const presentacionId = transferenciaGroup.get('presentacion_id')?.value;
    const almacenOrigenId = this.transferenciasForm.get('almacen_origen_id')?.value;

    if (presentacionId && almacenOrigenId) {
      const presentacion = this.presentacionesDisponibles().find(p => p.id === +presentacionId);
      if (presentacion) {
        const inventarioOrigen = presentacion.inventarios.find(inv => inv.almacen_id === +almacenOrigenId);
        if (inventarioOrigen) {
          // Usar lote_info.id en lugar de lote_id directamente
          transferenciaGroup.get('lote_id')?.setValue(inventarioOrigen.lote_info?.id || inventarioOrigen.lote_id);
          transferenciaGroup.get('stock_disponible')?.setValue(inventarioOrigen.stock_disponible);
        }
      }
    }

    // Reset cantidad when presentacion changes
    transferenciaGroup.get('cantidad')?.setValue('');
  }

  getAvailablePresentaciones(): PresentacionDisponible[] {
    const almacenOrigenId = this.transferenciasForm.get('almacen_origen_id')?.value;
    if (!almacenOrigenId) return [];

    return this.presentacionesDisponibles().filter(presentacion =>
      presentacion.inventarios.some(inv => inv.almacen_id === +almacenOrigenId && inv.stock_disponible > 0)
    );
  }

  getStockDisponible(presentacionId: number): number {
    const almacenOrigenId = this.transferenciasForm.get('almacen_origen_id')?.value;
    if (!presentacionId || !almacenOrigenId) return 0;

    const presentacion = this.presentacionesDisponibles().find(p => p.id === presentacionId);
    if (!presentacion) return 0;

    const inventarioOrigen = presentacion.inventarios.find(inv => inv.almacen_id === +almacenOrigenId);
    return inventarioOrigen?.stock_disponible || 0;
  }

  getLoteInfo(presentacionId: number): string {
    const almacenOrigenId = this.transferenciasForm.get('almacen_origen_id')?.value;
    if (!presentacionId || !almacenOrigenId) return '';

    const presentacion = this.presentacionesDisponibles().find(p => p.id === presentacionId);
    if (!presentacion) return '';

    const inventarioOrigen = presentacion.inventarios.find(inv => inv.almacen_id === +almacenOrigenId);
    // Usar lote_info.descripcion en lugar de lote_id.descripcion
    return inventarioOrigen?.lote_info?.descripcion || 'Sin descripción';
  }

  isFormValid(): boolean {
    return this.transferenciasForm.valid && this.transferenciasArray.length > 0;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.notificationService.showError('Por favor complete todos los campos requeridos');
      return;
    }

    const formValue = this.transferenciasForm.value;
    const transferenciasRequest: TransferenciaRequest = {
      almacen_origen_id: +formValue.almacen_origen_id,
      almacen_destino_id: +formValue.almacen_destino_id,
      transferencias: formValue.transferencias.map((t: any) => ({
        presentacion_id: +t.presentacion_id,
        lote_id: +t.lote_id,
        cantidad: t.cantidad.toString()
      }))
    };

    this.loadingService.startLoading();
    this.inventarioService.realizarTransferencia(transferenciasRequest).subscribe({
      next: (response) => {
        this.notificationService.showSuccess('Transferencia realizada exitosamente');
        this.resetForm();
        this.loadTransferenciasData(); // Reload data to get updated stock
        this.loadingService.stopLoading();
      },
      error: (error) => {
        console.error('Error realizando transferencia:', error);
        this.notificationService.showError('Error al realizar la transferencia');
        this.loadingService.stopLoading();
      }
    });
  }

  resetForm(): void {
    this.transferenciasForm.reset();
    this.transferenciasArray.clear();
  }
}