import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PedidoService } from './pedido.service';
import { environment } from '../../../../../environments/environment';
import { Pedido, PedidosResponse } from '../../../../types/contract.types';

describe('PedidoService', () => {
  let service: PedidoService;
  let httpTestingController: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/pedidos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PedidoService],
    });
    service = TestBed.inject(PedidoService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPedidos', () => {
    it('should fetch pedidos with pagination', () => {
      const mockPedido: Pedido = { id: 1, cliente_id: 1, fecha_creacion: new Date().toISOString(), estado: 'pendiente' };
      const mockResponse: PedidosResponse = {
        data: [mockPedido],
        pagination: { total: 1, page: 1, per_page: 10, pages: 1 },
      };

      service.getPedidos().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpTestingController.expectOne(`${apiUrl}?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getPedidoById', () => {
    it('should fetch a single pedido by id', () => {
      const mockPedido: Pedido = { id: 1, cliente_id: 1, fecha_creacion: new Date().toISOString(), estado: 'pendiente' };

      service.getPedidoById(1).subscribe(pedido => {
        expect(pedido).toEqual(mockPedido);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPedido);
    });
  });

  describe('createPedido', () => {
    it('should create a new pedido', () => {
      const newPedido: Omit<Pedido, 'id'> = { cliente_id: 1, fecha_creacion: new Date().toISOString(), estado: 'pendiente' };
      const createdPedido: Pedido = { id: 2, ...newPedido };

      service.createPedido(newPedido).subscribe(pedido => {
        expect(pedido).toEqual(createdPedido);
      });

      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      req.flush(createdPedido);
    });
  });

  describe('updatePedido', () => {
    it('should update an existing pedido', () => {
      const updatedPedido: Pedido = { id: 1, cliente_id: 1, fecha_creacion: new Date().toISOString(), estado: 'en_proceso' };

      service.updatePedido(1, { estado: 'en_proceso' }).subscribe(pedido => {
        expect(pedido).toEqual(updatedPedido);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(updatedPedido);
    });
  });

  describe('deletePedido', () => {
    it('should delete a pedido', () => {
      service.deletePedido(1).subscribe();

      const req = httpTestingController.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });
});
