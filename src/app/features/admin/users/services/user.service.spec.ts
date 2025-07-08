import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { environment } from '../../../../../environments/environment';
import { User, UsuariosResponse } from '../../../../types/contract.types';

describe('UserService', () => {
  let service: UserService;
  let httpTestingController: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/users`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });
    service = TestBed.inject(UserService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers', () => {
    it('should fetch users with pagination', () => {
      const mockUser: User = { id: 1, username: 'test', rol: 'admin', almacen_id: 1 };
      const mockResponse: UsuariosResponse = {
        data: [mockUser],
        pagination: { total: 1, page: 1, per_page: 10, pages: 1 },
      };

      service.getUsers().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpTestingController.expectOne(`${apiUrl}?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getUserById', () => {
    it('should fetch a single user by id', () => {
      const mockUser: User = { id: 1, username: 'test', rol: 'admin', almacen_id: 1 };

      service.getUserById(1).subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  });

  describe('createUser', () => {
    it('should create a new user', () => {
      const newUser: Omit<User, 'id'> = { username: 'newuser', rol: 'seller', almacen_id: 2, password: 'password' };
      const createdUser: User = { id: 2, ...newUser };

      service.createUser(newUser).subscribe(user => {
        expect(user).toEqual(createdUser);
      });

      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      req.flush(createdUser);
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', () => {
      const updatedUser: User = { id: 1, username: 'updateduser', rol: 'admin', almacen_id: 1 };

      service.updateUser(1, { username: 'updateduser' }).subscribe(user => {
        expect(user).toEqual(updatedUser);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(updatedUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', () => {
      service.deleteUser(1).subscribe();

      const req = httpTestingController.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });
});
