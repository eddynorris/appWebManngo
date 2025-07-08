import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Producto, ProductosResponse } from '../../../../../types/contract.types';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig, ActionConfig } from '../../../../../shared/components/data-table/data-table.types';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { ConfirmationModalComponent } from '../../../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-products-list-page',
  standalone: true,
  imports: [RouterLink, FormsModule, DataTableComponent, ConfirmationModalComponent],
  templateUrl: './products-list-page.component.html',
  styleUrl: './products-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProductsListPageComponent {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  // State management with signals
  products = signal<Producto[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  totalProducts = signal(0);
  isDeleteModalVisible = signal(false);
  productToDelete = signal<Producto | null>(null);

  // -- Configuración de la Tabla --
  columns: ColumnConfig<Producto>[] = [
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    { key: 'precio_compra', label: 'Precio Compra', type: 'currency' },
    { key: 'activo', label: 'Estado', type: 'status' },
    { key: 'actions', label: 'Acciones', type: 'actions' }
  ];

  actions: ActionConfig[] = [
    { icon: '✏️', label: 'Editar', action: 'edit' },
    { icon: '🔄', label: 'Activar/Desactivar', action: 'toggleStatus' },
    { icon: '🗑️', label: 'Eliminar', action: 'delete', danger: true },
  ];
  // -- Fin Configuración de la Tabla --

  // Computed values
  filteredProducts = computed(() => {
    const search = this.searchTerm().toLowerCase();
    if (!search) return this.products();

    return this.products().filter(product =>
      product.nombre?.toLowerCase().includes(search) ||
      product.descripcion?.toLowerCase().includes(search)
    );
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    // Usamos el `searchTerm` para la búsqueda en API si existe
    this.productService.loadProducts(1, 10, this.searchTerm() || undefined).subscribe({
      next: (response: ProductosResponse) => {
        this.products.set(response.data);
        this.totalProducts.set(response.pagination.total);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.notificationService.showError('Ocurrió un error al cargar los productos.');
        console.error('Error loading products', err);
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value as string);
    this.loadProducts(); // Recargar productos con el nuevo término de búsqueda
  }

  handleTableAction(event: { action: string; item: Producto }): void {
    switch (event.action) {
      case 'edit':
        this.editProduct(event.item);
        break;
      case 'delete':
        this.askForDeleteConfirmation(event.item);
        break;
      case 'toggleStatus':
        this.toggleProductStatus(event.item);
        break;
    }
  }

  private editProduct(product: Producto): void {
    this.router.navigate(['/admin/products/edit', product.id]);
  }

  private askForDeleteConfirmation(product: Producto): void {
    this.productToDelete.set(product);
    this.isDeleteModalVisible.set(true);
  }

  handleDeleteConfirmation(): void {
    const product = this.productToDelete();
    if (!product) return;

    this.productService.deleteProduct(product.id!).subscribe({
      next: () => {
        this.notificationService.showSuccess('Producto eliminado correctamente.');
        this.loadProducts();
      },
      error: (err: any) => {
        this.notificationService.showError('Ocurrió un error al eliminar el producto.');
        console.error('Error deleting product', err);
      }
    });

    this.closeDeleteModal();
  }

  closeDeleteModal(): void {
    this.isDeleteModalVisible.set(false);
    this.productToDelete.set(null);
  }

  private toggleProductStatus(product: Producto): void {
    this.productService.toggleProductStatus(product.id!, !product.activo).subscribe({
      next: () => {
        this.notificationService.showSuccess('Estado del producto actualizado.');
        this.loadProducts();
      },
      error: (err: any) => {
        this.notificationService.showError('Ocurrió un error al actualizar el estado.');
        console.error('Error updating product status', err);
      }
    });
  }

  formatPrice(price: string | number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(Number(price));
  }
}
