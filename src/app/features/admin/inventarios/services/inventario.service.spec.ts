import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InventarioService } from './inventario.service';
import { environment } from '../../../../../environments/environment';
import { Inventario, InventariosResponse } from '../../../../types/contract.types';

describe('InventarioService', () => {
  let service: InventarioService;
  let httpTestingController: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/inventarios`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InventarioService],
    });
    service = TestBed.inject(InventarioService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getInventarios', () => {
    it('should fetch inventarios with pagination', () => {
      const mockInventario: Inventario = { id: 1, presentacion_id: 1, almacen_id: 1, cantidad: 100 };
      const mockResponse: InventariosResponse = {
        data: [mockInventario],
        pagination: { total: 1, page: 1, per_page: 10, pages: 1 },
      };

      service.getInventarios().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpTestingController.expectOne(`${apiUrl}?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should fetch inventarios with almacenId filter', () => {
        const mockInventario: Inventario = { id: 1, presentacion_id: 1, almacen_id: 5, cantidad: 50 };
        const mockResponse: InventariosResponse = {
          data: [mockInventario],
          pagination: { total: 1, page: 1, per_page: 10, pages: 1 },
        };

        service.getInventarios(1, 10, 5).subscribe(response => {
          expect(response).toEqual(mockResponse);
        });

        const req = httpTestingController.expectOne(`${apiUrl}?page=1&limit=10&almacen_id=5`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
      });
  });
});
