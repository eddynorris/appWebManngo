import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PagoService } from './pago.service';
import { environment } from '../../../../../environments/environment';
import { Pago, PagosResponse } from '../../../../types/contract.types';

describe('PagoService', () => {
  let service: PagoService;
  let httpTestingController: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/pagos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PagoService],
    });
    service = TestBed.inject(PagoService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPagos', () => {
    it('should fetch pagos with pagination', () => {
      const mockPago: Pago = { id: 1, venta_id: 1, monto: '100', fecha: new Date().toISOString() };
      const mockResponse: PagosResponse = {
        data: [mockPago],
        pagination: { total: 1, page: 1, per_page: 10, pages: 1 },
      };

      service.getPagos().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpTestingController.expectOne(`${apiUrl}?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getPagoById', () => {
    it('should fetch a single pago by id', () => {
      const mockPago: Pago = { id: 1, venta_id: 1, monto: '100', fecha: new Date().toISOString() };

      service.getPagoById(1).subscribe(pago => {
        expect(pago).toEqual(mockPago);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPago);
    });
  });

  describe('createPago', () => {
    it('should create a new pago', () => {
      const newPago: Omit<Pago, 'id'> = { venta_id: 1, monto: '150', fecha: new Date().toISOString() };
      const createdPago: Pago = { id: 2, ...newPago };

      service.createPago(newPago).subscribe(pago => {
        expect(pago).toEqual(createdPago);
      });

      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      req.flush(createdPago);
    });
  });

  describe('updatePago', () => {
    it('should update an existing pago', () => {
      const updatedPago: Pago = { id: 1, venta_id: 1, monto: '120', fecha: new Date().toISOString() };

      service.updatePago(1, { monto: '120' }).subscribe(pago => {
        expect(pago).toEqual(updatedPago);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(updatedPago);
    });
  });

  describe('deletePago', () => {
    it('should delete a pago', () => {
      service.deletePago(1).subscribe();

      const req = httpTestingController.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });
});
