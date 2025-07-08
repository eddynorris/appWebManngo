import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Producto, PresentacionProducto, ProductosResponse } from '../../../../types/contract.types';

// TODO: Refactorizar para usar PaginatedResponse<Producto> de contract.types.ts
// export interface ProductsResponse {
//   data: Producto[];
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// }

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/productos`;

  // Estado de productos usando signals
  private readonly productos = signal<Producto[]>([]);
  private readonly isLoading = signal(false);
  private readonly lastSearch = signal<string>('');
  private readonly currentPage = signal(1);
  private readonly totalPages = signal(1);

  // Getters públicos (readonly)
  readonly getProductos = this.productos.asReadonly();
  readonly getIsLoading = this.isLoading.asReadonly();
  readonly getCurrentPage = this.currentPage.asReadonly();
  readonly getTotalPages = this.totalPages.asReadonly();

  // Computed values
  readonly hasProducts = computed(() => this.productos().length > 0);
  readonly hasNextPage = computed(() => this.currentPage() < this.totalPages());
  readonly hasPrevPage = computed(() => this.currentPage() > 1);

  // Obtener productos con paginación y caché
  loadProducts(page = 1, limit = 10, search?: string, forceReload = false): Observable<ProductosResponse> {
    // Si es la misma búsqueda y página, y no forzamos recarga, usar caché
    if (!forceReload &&
        search === this.lastSearch() &&
        page === this.currentPage() &&
        this.hasProducts()) {
      return new Observable(subscriber => {
        subscriber.next({
          data: this.productos(),
          pagination: {
            total: this.productos().length,
            page: this.currentPage(),
            per_page: limit,
            pages: this.totalPages()
          }
        });
        subscriber.complete();
      });
    }

    this.isLoading.set(true);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ProductosResponse>(this.apiUrl, { params }).pipe(
      tap(response => {
        // Actualizar el estado local
        this.productos.set(response.data || []);
        this.currentPage.set(page);
        this.totalPages.set(response.pagination.pages || 1);
        this.lastSearch.set(search || '');
        this.isLoading.set(false);
      })
    );
  }

  // Obtener un producto por ID
  getProductById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo producto
  createProduct(product: Omit<Producto, 'id'>): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, product).pipe(
      tap(newProduct => {
        // Agregar el nuevo producto al estado local
        this.productos.update(products => [newProduct, ...products]);
      })
    );
  }

  // Actualizar un producto existente
  updateProduct(id: number, product: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, product).pipe(
      tap(updatedProduct => {
        // Actualizar el producto en el estado local
        this.productos.update(products =>
          products.map(p => p.id === id ? updatedProduct : p)
        );
      })
    );
  }

  // Eliminar un producto
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Remover el producto del estado local
        this.productos.update(products =>
          products.filter(p => p.id !== id)
        );
      })
    );
  }

  // Activar/Desactivar un producto
  toggleProductStatus(id: number, active: boolean): Observable<Producto> {
    return this.http.patch<Producto>(`${this.apiUrl}/${id}/status`, { activo: active }).pipe(
      tap(updatedProduct => {
        // Actualizar el estado del producto en el estado local
        this.productos.update(products =>
          products.map(p => p.id === id ? updatedProduct : p)
        );
      })
    );
  }

  // Buscar en la caché local
  findProductInCache(id: number): Producto | undefined {
    return this.productos().find(p => p.id === id);
  }

  // Limpiar caché (útil para logout o refresh manual)
  clearCache(): void {
    this.productos.set([]);
    this.currentPage.set(1);
    this.totalPages.set(1);
    this.lastSearch.set('');
  }

  // Refrescar datos
  refresh(): void {
    const search = this.lastSearch();
    const page = this.currentPage();
    this.loadProducts(page, 10, search, true).subscribe();
  }

  // Obtener todas las presentaciones de productos
  getAllPresentaciones(): Observable<PresentacionProducto[]> {
    return this.http.get<PresentacionProducto[]>(`${this.apiUrl}/presentaciones`);
  }
}
