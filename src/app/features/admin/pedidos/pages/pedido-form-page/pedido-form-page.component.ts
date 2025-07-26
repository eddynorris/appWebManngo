import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import { PedidoService } from '../../services/pedido.service';
import { ClienteService } from '../../../clientes/services/cliente.service';
import { ProductService } from '../../../productos/services/product.service';

import { Pedido, Cliente, PresentacionProducto } from '../../../../../types/contract.types';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-pedido-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './pedido-form-page.component.html',
  styleUrl: './pedido-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PedidoFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly pedidoService = inject(PedidoService);
  private readonly clienteService = inject(ClienteService);
  private readonly productService = inject(ProductService);
  private readonly notificationService = inject(NotificationService);

  // FontAwesome icons
  faTrash = faTrash;

  pedidoForm: FormGroup;
  isLoading = signal(false);
  isEditMode = signal(false);
  pedidoId = signal<number | null>(null);

  clientes = signal<Cliente[]>([]);
  presentaciones = signal<PresentacionProducto[]>([]);
  estados = signal(['pendiente', 'en_proceso', 'listo_para_entrega', 'entregado', 'cancelado']);

  constructor() {
    this.pedidoForm = this.fb.group({
      cliente_id: ['', Validators.required],
      almacen_id: [1, Validators.required], // TODO: Make this dynamic
      fecha_entrega: ['', Validators.required],
      estado: ['pendiente', Validators.required],
      notas: [''],
      detalles: this.fb.array([], Validators.required),
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.pedidoId.set(+id);
      this.loadPedidoData(+id);
    } else {
      this.addDetalle();
    }
  }

  loadInitialData(): void {
    this.clienteService.getClientes().subscribe(response => this.clientes.set(response.data));
    this.productService.getAllPresentaciones().subscribe(response => this.presentaciones.set(response));
  }

  loadPedidoData(id: number): void {
    this.isLoading.set(true);
    this.pedidoService.getPedidoById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe(pedido => {
        this.pedidoForm.patchValue({
          ...pedido,
          fecha_entrega: new Date(pedido.fecha_entrega!).toISOString().substring(0, 10),
        });
        const detallesFormGroups = pedido.detalles?.map(d => this.createDetalleGroup(d)) || [];
        this.pedidoForm.setControl('detalles', this.fb.array(detallesFormGroups));
      });
  }

  get detalles(): FormArray {
    return this.pedidoForm.get('detalles') as FormArray;
  }

  createDetalleGroup(detalle?: any): FormGroup {
    return this.fb.group({
      presentacion_id: [detalle?.presentacion_id || '', Validators.required],
      cantidad: [detalle?.cantidad || 1, [Validators.required, Validators.min(1)]],
      precio_estimado: [detalle?.precio_estimado || 0],
    });
  }

  addDetalle(): void {
    this.detalles.push(this.createDetalleGroup());
  }

  removeDetalle(index: number): void {
    this.detalles.removeAt(index);
  }

  onSubmit(): void {
    if (this.pedidoForm.invalid) {
      this.notificationService.showError('Formulario inválido.');
      return;
    }

    this.isLoading.set(true);
    const formValue = this.pedidoForm.getRawValue();
    const id = this.pedidoId();

    const payload: Partial<Pedido> = {
      ...formValue,
      cliente_id: Number(formValue.cliente_id),
      almacen_id: Number(formValue.almacen_id),
      detalles: formValue.detalles.map((d: any) => ({
        presentacion_id: Number(d.presentacion_id),
        cantidad: Number(d.cantidad),
        precio_estimado: String(d.precio_estimado),
      }))
    };

    const operation$ = id
      ? this.pedidoService.updatePedido(id, payload)
      : this.pedidoService.createPedido(payload as Pedido);

    operation$
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(`Pedido ${id ? 'actualizado' : 'creado'} correctamente.`);
          this.router.navigate(['/admin/pedidos']);
        },
        error: (err) => {
          this.notificationService.showError(`Error al ${id ? 'actualizar' : 'crear'} el pedido.`);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/pedidos']);
  }
}
