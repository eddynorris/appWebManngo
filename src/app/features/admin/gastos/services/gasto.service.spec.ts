import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GastoService } from './gasto.service';
import { environment } from '../../../../../environments/environment';
import { Gasto, GastosResponse } from '../../../../types/contract.types';

describe('GastoService', () => {
  let service: GastoService;
  let httpTestingController: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/gastos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GastoService],
    });
    service = TestBed.inject(GastoService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getGastos', () => {
    it('should fetch gastos with pagination', () => {
      const mockGasto: Gasto = { id: 1, descripcion: 'Gasto de prueba', monto: '100', fecha: new Date().toISOString() };
      const mockResponse: GastosResponse = {
        data: [mockGasto],
        pagination: { total: 1, page: 1, per_page: 10, pages: 1 },
      };

      service.getGastos().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpTestingController.expectOne(`${apiUrl}?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getGastoById', () => {
    it('should fetch a single gasto by id', () => {
      const mockGasto: Gasto = { id: 1, descripcion: 'Gasto de prueba', monto: '100', fecha: new Date().toISOString() };

      service.getGastoById(1).subscribe(gasto => {
        expect(gasto).toEqual(mockGasto);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockGasto);
    });
  });

  describe('createGasto', () => {
    it('should create a new gasto', () => {
      const newGasto: Omit<Gasto, 'id'> = { descripcion: 'Nuevo Gasto', monto: '250', fecha: new Date().toISOString() };
      const createdGasto: Gasto = { id: 2, ...newGasto };

      service.createGasto(newGasto).subscribe(gasto => {
        expect(gasto).toEqual(createdGasto);
      });

      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      req.flush(createdGasto);
    });
  });

  describe('updateGasto', () => {
    it('should update an existing gasto', () => {
      const updatedGasto: Gasto = { id: 1, descripcion: 'Gasto actualizado', monto: '150', fecha: new Date().toISOString() };

      service.updateGasto(1, { descripcion: 'Gasto actualizado', monto: '150' }).subscribe(gasto => {
        expect(gasto).toEqual(updatedGasto);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(updatedGasto);
    });
  });

  describe('deleteGasto', () => {
    it('should delete a gasto', () => {
      service.deleteGasto(1).subscribe();

      const req = httpTestingController.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });
});
