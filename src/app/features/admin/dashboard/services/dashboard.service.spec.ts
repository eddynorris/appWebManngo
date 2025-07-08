import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { environment } from '../../../../../environments/environment';
import { DashboardResponse } from '../../../../types/dashboard.types';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpTestingController: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/dashboard`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService],
    });
    service = TestBed.inject(DashboardService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDashboardData', () => {
    it('should fetch dashboard data', () => {
      const mockResponse: DashboardResponse = {
        alertas_stock_bajo: [],
        alertas_lotes_bajos: [],
        clientes_con_saldo_pendiente: [],
      };

      service.getDashboardData().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
