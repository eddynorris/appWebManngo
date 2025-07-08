import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VentaService } from './venta.service';
import { environment } from '../../../../../environments/environment';
import { Venta, VentasResponse } from '../../../../types/contract.types';

describe('VentaService', () => {
  let service: VentaService;
  let httpTestingController: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/ventas`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VentaService],
    });
    service = TestBed.inject(VentaService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getVentas', () => {
    it('should fetch ventas with pagination', () => {
      const mockResponse: VentasResponse = {
        data: [{ id: 1, cliente_id: 1, total: '100', fecha: new Date().toISOString() }],
        pagination: { total: 1, page: 1, per_page: 10, pages: 1 },
      };

      service.getVentas().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpTestingController.expectOne(`${apiUrl}?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should fetch ventas with filters', () => {
        const mockResponse: VentasResponse = {
          data: [{ id: 1, cliente_id: 1, total: '100', fecha: new Date().toISOString() }],
          pagination: { total: 1, page: 1, per_page: 10, pages: 1 },
        };

        service.getVentas(1, 10, { cliente_id: 1, estado_pago: 'pendiente' }).subscribe(response => {
          expect(response).toEqual(mockResponse);
        });

        const req = httpTestingController.expectOne(`${apiUrl}?page=1&limit=10&cliente_id=1&estado_pago=pendiente`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
      });
  });

  describe('getVentaById', () => {
    it('should fetch a single venta by id', () => {
      const mockVenta: Venta = { id: 1, cliente_id: 1, total: '100', fecha: new Date().toISOString() };

      service.getVentaById(1).subscribe(venta => {
        expect(venta).toEqual(mockVenta);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockVenta);
    });
  });

  describe('createVenta', () => {
    it('should create a new venta', () => {
      const newVenta: Omit<Venta, 'id'> = { cliente_id: 1, total: '150', fecha: new Date().toISOString() };
      const createdVenta: Venta = { id: 2, ...newVenta };

      service.createVenta(newVenta).subscribe(venta => {
        expect(venta).toEqual(createdVenta);
      });

      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      req.flush(createdVenta);
    });
  });

  describe('updateVenta', () => {
    it('should update an existing venta', () => {
      const updatedVenta: Venta = { id: 1, cliente_id: 1, total: '120', fecha: new Date().toISOString() };

      service.updateVenta(1, { total: '120' }).subscribe(venta => {
        expect(venta).toEqual(updatedVenta);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(updatedVenta);
    });
  });

  describe('cancelVenta', () => {
    it('should cancel a venta', () => {
        const canceledVenta: Venta = { id: 1, cliente_id: 1, total: '100', fecha: new Date().toISOString(), estado_pago: 'cancelado' };

        service.cancelVenta(1).subscribe(venta => {
            expect(venta).toEqual(canceledVenta);
        });

        const req = httpTestingController.expectOne(`${apiUrl}/1/cancelar`);
        expect(req.request.method).toBe('PATCH');
        req.flush(canceledVenta);
    });
  });

  describe('updateEstadoPago', () => {
    it('should update the payment status of a venta', () => {
        const updatedVenta: Venta = { id: 1, cliente_id: 1, total: '100', fecha: new Date().toISOString(), estado_pago: 'pagado' };

        service.updateEstadoPago(1, 'pagado').subscribe(venta => {
            expect(venta).toEqual(updatedVenta);
        });

        const req = httpTestingController.expectOne(`${apiUrl}/1/estado-pago`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual({ estado_pago: 'pagado' });
        req.flush(updatedVenta);
    });
  });

});
