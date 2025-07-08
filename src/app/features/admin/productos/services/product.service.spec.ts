import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { environment } from '../../../../../environments/environment';
import { Producto, PresentacionProducto, ProductosResponse } from '../../../../types/contract.types';

describe('ProductService', () => {
  let service: ProductService;
  let httpTestingController: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/productos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService],
    });
    service = TestBed.inject(ProductService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadProducts', () => {
    it('should fetch products and update signals', () => {
      const mockResponse: ProductosResponse = {
        data: [{ id: 1, nombre: 'Test Product', descripcion: 'Desc', precio_compra: '100', activo: true, presentaciones: [] }],
        pagination: { total: 1, page: 1, per_page: 10, pages: 1 }
      };

      service.loadProducts().subscribe();

      const req = httpTestingController.expectOne(`${apiUrl}?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      expect(service.getProductos()).toEqual(mockResponse.data);
      expect(service.getCurrentPage()).toBe(1);
      expect(service.getTotalPages()).toBe(1);
      expect(service.getIsLoading()).toBe(false);
    });
  });

  describe('getProductById', () => {
    it('should fetch a single product by id', () => {
      const mockProduct: Producto = { id: 1, nombre: 'Test Product', descripcion: 'Desc', precio_compra: '100', activo: true, presentaciones: [] };

      service.getProductById(1).subscribe(product => {
        expect(product).toEqual(mockProduct);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProduct);
    });
  });

  describe('createProduct', () => {
    it('should create a new product and update signals', () => {
      const newProduct: Omit<Producto, 'id'> = { nombre: 'New Product', descripcion: 'New Desc', precio_compra: '150', activo: true, presentaciones: [] };
      const createdProduct: Producto = { id: 2, ...newProduct };

      service.createProduct(newProduct).subscribe(product => {
        expect(product).toEqual(createdProduct);
      });

      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      req.flush(createdProduct);

      expect(service.getProductos()).toContain(createdProduct);
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product and update signals', () => {
      const updatedProduct: Producto = { id: 1, nombre: 'Updated Product', descripcion: 'Old Desc', precio_compra: '120', activo: true, presentaciones: [] };
      // Pre-fill cache
      service['productos'].set([ { id: 1, nombre: 'Old Product', descripcion: 'Old Desc', precio_compra: '100', activo: true, presentaciones: [] } ]);

      service.updateProduct(1, { nombre: 'Updated Product', precio_compra: '120' }).subscribe(product => {
        expect(product).toEqual(updatedProduct);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(updatedProduct);

      expect(service.getProductos().find(p => p.id === 1)?.nombre).toBe('Updated Product');
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product and remove it from signals', () => {
       // Pre-fill cache
       const initialProducts: Producto[] = [{ id: 1, nombre: 'Test Product', descripcion: 'Desc', precio_compra: '100', activo: true, presentaciones: [] }];
       service['productos'].set(initialProducts);

       service.deleteProduct(1).subscribe();

       const req = httpTestingController.expectOne(`${apiUrl}/1`);
       expect(req.request.method).toBe('DELETE');
       req.flush(null, { status: 204, statusText: 'No Content' });

       expect(service.getProductos().length).toBe(0);
    });
  });

  describe('toggleProductStatus', () => {
    it('should toggle product status and update signals', () => {
      const productToToggle: Producto = { id: 1, nombre: 'Test Product', descripcion: 'Desc', precio_compra: '100', activo: true, presentaciones: [] };
      const updatedProduct: Producto = { ...productToToggle, activo: false };

      // Pre-fill cache
      service['productos'].set([productToToggle]);

      service.toggleProductStatus(1, false).subscribe(product => {
        expect(product).toEqual(updatedProduct);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/1/status`);
      expect(req.request.method).toBe('PATCH');
      req.flush(updatedProduct);

      expect(service.getProductos().find(p => p.id === 1)?.activo).toBe(false);
    });
  });

  describe('getAllPresentaciones', () => {
    it('should fetch all product presentaciones', () => {
        const mockPresentaciones: PresentacionProducto[] = [
            { id: 1, nombre: 'Caja', tipo: 'UNIDAD', capacidad_kg: '10', precio_venta: '200' },
            { id: 2, nombre: 'Bolsa', tipo: 'GRANEL', capacidad_kg: '1', precio_venta: '25' }
        ];

        service.getAllPresentaciones().subscribe(presentaciones => {
            expect(presentaciones).toEqual(mockPresentaciones);
        });

        const req = httpTestingController.expectOne(`${apiUrl}/presentaciones`);
        expect(req.request.method).toBe('GET');
        req.flush(mockPresentaciones);
    });
  });
});
