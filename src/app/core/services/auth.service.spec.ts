import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../../types/auth.types';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;
  let router: Router;

  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
  };

  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter },
      ],
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    // Clear session storage before each test
    sessionStorage.clear();
    // Reset spy calls
    mockRouter.navigate.calls.reset();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isAuthenticated should be false initially if no token is present', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  describe('login', () => {
    it('should return true, set token, and update signal on successful login', () => {
      const mockResponse: AuthResponse = {
        access_token: '12345',
        token_type: 'bearer',
        expires_in: 3600,
        user: {
          id: 1,
          username: 'testuser',
          rol: 'admin',
          almacen_id: 1,
          almacen_nombre: 'Principal'
        }
      };

      service.login('user', 'pass').subscribe(result => {
        expect(result).toBe(true);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/auth`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);

      expect(sessionStorage.getItem('authToken')).toBe('12345');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false and not update state on failed login', () => {
      service.login('user', 'wrongpass').subscribe(result => {
        expect(result).toBe(false);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/auth`);
      expect(req.request.method).toBe('POST');
      req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });

      expect(sessionStorage.getItem('authToken')).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear token, update signal, and navigate to login', () => {
      // Setup initial state as logged in
      sessionStorage.setItem('authToken', 'test-token');
      service.isAuthenticated.set(true);

      service.logout();

      expect(sessionStorage.getItem('authToken')).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/admin/login']);
    });
  });

  describe('getToken', () => {
    it('should return the token from session storage', () => {
      sessionStorage.setItem('authToken', 'my-secret-token');
      expect(service.getToken()).toBe('my-secret-token');
    });

    it('should return null if no token is in session storage', () => {
      expect(service.getToken()).toBeNull();
    });
  });
});
