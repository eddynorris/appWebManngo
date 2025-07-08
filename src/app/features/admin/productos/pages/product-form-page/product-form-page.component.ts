import { ChangeDetectionStrategy, Component, inject, computed, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { finalize, Observable } from 'rxjs';
import { Producto, PresentacionProducto } from '../../../../../types/contract.types';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-product-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './product-form-page.component.html',
  styleUrl: './product-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProductFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly notificationService = inject(NotificationService);

  isLoading = signal(false);
  private productId = signal<number | null>(null);

  isEditMode = computed(() => this.productId() !== null);

  // Formulario principal
  productForm = this.fb.group({
    id: [null as number | null],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: [''],
    precio_compra: [0, [Validators.required, Validators.min(0)]],
    activo: [true],
    presentaciones: this.fb.array([]), // FormArray para las presentaciones
  });

  // Getter para acceder fácilmente al FormArray desde la plantilla
  get presentaciones() {
    return this.productForm.get('presentaciones') as FormArray;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productId.set(+id);
        this.loadProductData(+id);
      }
    });
  }

  private loadProductData(id: number): void {
    this.isLoading.set(true);
    this.productService.getProductById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe(product => {
        this.presentaciones.clear();
        product.presentaciones?.forEach(p => this.presentaciones.push(this.createPresentacionGroup(p)));

        // Convertir strings a numbers antes de hacer patch
        const productForForm = {
          ...product,
          precio_compra: Number(product.precio_compra)
        };
        this.productForm.patchValue(productForForm);
      });
  }

  // Crear un nuevo FormGroup para una presentación
  createPresentacionGroup(presentacion?: PresentacionProducto): FormGroup {
    const group = this.fb.group({
      id: [null as number | null],
      nombre: ['', Validators.required],
      capacidad_kg: [1, [Validators.required, Validators.min(0.01)]],
      tipo: ['Bolsa', Validators.required],
      precio_venta: [0, [Validators.required, Validators.min(0)]],
      activo: [true],
      url_foto: [''],
    });

    if (presentacion) {
      // Convertir strings a numbers antes de hacer patch
      const presentacionForForm = {
        ...presentacion,
        capacidad_kg: Number(presentacion.capacidad_kg),
        precio_venta: Number(presentacion.precio_venta)
      };
      group.patchValue(presentacionForForm);
    }
    return group;
  }

  // Añadir una nueva presentación al FormArray
  addPresentacion(): void {
    this.presentaciones.push(this.createPresentacionGroup());
  }

  // Eliminar una presentación del FormArray por su índice
  removePresentacion(index: number): void {
    this.presentaciones.removeAt(index);
  }

  // Lógica para guardar o actualizar
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.notificationService.showError('Por favor, completa todos los campos requeridos.');
      return;
    }

    this.isLoading.set(true);
    const productFormValue = this.productForm.getRawValue();
    const id = this.productId();

    // Convertir numbers a strings para el payload de la API
    const payload: any = {
      ...productFormValue,
      precio_compra: String(productFormValue.precio_compra),
      presentaciones: productFormValue.presentaciones.map((p: any) => ({
        ...p,
        capacidad_kg: String(p.capacidad_kg),
        precio_venta: String(p.precio_venta),
      })),
    };

    let operation$: Observable<Producto>;

    if (id) {
      delete payload.id; // El ID se envía en la URL para actualizaciones, no en el body.
      operation$ = this.productService.updateProduct(id, payload);
    } else {
      delete payload.id; // Asegurarse de que el ID (null) no se envíe al crear.
      operation$ = this.productService.createProduct(payload);
    }

    operation$.pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (savedProduct) => {
          this.notificationService.showSuccess(`Producto "${savedProduct.nombre}" guardado correctamente.`);
          this.router.navigate(['/admin/products']);
        },
        error: (err: any) => {
          this.notificationService.showError('Ocurrió un error al guardar el producto.');
          console.error('Error al guardar el producto', err);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/products']);
  }
}
