import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClienteService } from './cliente.service';
import { environment } from '../../../../../environments/environment';
import { ClientesResponse, Cliente } from '../../../../types/contract.types';

describe('ClienteService', () => {
  let service: ClienteService;
  let httpTestingController: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/clientes`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClienteService],
    });
    service = TestBed.inject(ClienteService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify(); // Verifica que no haya solicitudes pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getClientes', () => {
    it('should return a paginated list of clients', () => {
      const mockResponse: ClientesResponse = {
        data: [{ id: 1, nombre: 'Test Client' }],
        pagination: { total: 1, page: 1, per_page: 10, pages: 1 },
      };

      service.getClientes(1, 10).subscribe(response => {
        expect(response.data.length).toBe(1);
        expect(response).toEqual(mockResponse);
      });

      const req = httpTestingController.expectOne(`${apiUrl}?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getClienteById', () => {
    it('should return a single client', () => {
      const mockCliente: Cliente = { id: 1, nombre: 'Test Client' };
      const clientId = 1;

      service.getClienteById(clientId).subscribe(client => {
        expect(client).toEqual(mockCliente);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/${clientId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCliente);
    });
  });

  describe('createCliente', () => {
    it('should create a new client and return it', () => {
      const newCliente: Omit<Cliente, 'id'> = { nombre: 'New Client' };
      const mockResponse: Cliente = { id: 2, ...newCliente };

      service.createCliente(newCliente).subscribe(client => {
        expect(client).toEqual(mockResponse);
      });

      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newCliente);
      req.flush(mockResponse);
    });
  });

  describe('updateCliente', () => {
    it('should update an existing client and return it', () => {
      const updatedData: Partial<Cliente> = { nombre: 'Updated Client' };
      const clientId = 1;
      const mockResponse: Cliente = { id: clientId, nombre: 'Updated Client' };

      service.updateCliente(clientId, updatedData).subscribe(client => {
        expect(client).toEqual(mockResponse);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/${clientId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedData);
      req.flush(mockResponse);
    });
  });

  describe('deleteCliente', () => {
    it('should delete a client', () => {
      const clientId = 1;

      service.deleteCliente(clientId).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpTestingController.expectOne(`${apiUrl}/${clientId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
