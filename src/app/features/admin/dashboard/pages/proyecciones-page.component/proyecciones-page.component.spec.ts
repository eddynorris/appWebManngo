import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProyeccionesPageComponent } from './proyecciones-page.component';
import { ClienteService } from '../../../clientes/services/cliente.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../../shared/services/notification.service';

describe('ProyeccionesPageComponent', () => {
  let component: ProyeccionesPageComponent;
  let fixture: ComponentFixture<ProyeccionesPageComponent>;
  let clienteServiceMock: any;

  beforeEach(async () => {
    clienteServiceMock = {
      getClientesProyecciones: jasmine.createSpy('getClientesProyecciones').and.returnValue(
        of({ data: [], pagination: { total: 0, page: 1, per_page: 10, pages: 0 } })
      ),
      exportarProyecciones: jasmine.createSpy('exportarProyecciones').and.returnValue(of(new Blob()))
    };

    await TestBed.configureTestingModule({
      imports: [ProyeccionesPageComponent],
      providers: [
        { provide: ClienteService, useValue: clienteServiceMock },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: NotificationService, useValue: { showError: () => {}, showSuccess: () => {} } as any }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProyeccionesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sets quick range for "Mañana" from today to tomorrow and calls service', () => {
    clienteServiceMock.getClientesProyecciones.calls.reset();
    const today = new Date();
    const yyyy1 = today.getFullYear();
    const mm1 = String(today.getMonth() + 1).padStart(2, '0');
    const dd1 = String(today.getDate()).padStart(2, '0');
    const start = `${yyyy1}-${mm1}-${dd1}`;
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yyyy2 = tomorrow.getFullYear();
    const mm2 = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd2 = String(tomorrow.getDate()).padStart(2, '0');
    const end = `${yyyy2}-${mm2}-${dd2}`;

    component.setQuickRange('manana');

    expect(clienteServiceMock.getClientesProyecciones).toHaveBeenCalled();
    const args = clienteServiceMock.getClientesProyecciones.calls.mostRecent().args;
    // Args: page, per_page, search, ciudad, solo_con_proyeccion, fecha_desde, fecha_hasta, order_by
    expect(args[5]).toBe(start); // fecha_desde
    expect(args[6]).toBe(end); // fecha_hasta
  });

  it('sets quick range for "Semana" and calls service with 7-day span', () => {
    clienteServiceMock.getClientesProyecciones.calls.reset();
    const today = new Date();
    const yyyy1 = today.getFullYear();
    const mm1 = String(today.getMonth() + 1).padStart(2, '0');
    const dd1 = String(today.getDate()).padStart(2, '0');
    const start = `${yyyy1}-${mm1}-${dd1}`;
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 7);
    const yyyy2 = endDate.getFullYear();
    const mm2 = String(endDate.getMonth() + 1).padStart(2, '0');
    const dd2 = String(endDate.getDate()).padStart(2, '0');
    const end = `${yyyy2}-${mm2}-${dd2}`;

    component.setQuickRange('semana');

    const args = clienteServiceMock.getClientesProyecciones.calls.mostRecent().args;
    expect(args[5]).toBe(start);
    expect(args[6]).toBe(end);
  });

  it('updates ciudad via select and triggers load', () => {
    clienteServiceMock.getClientesProyecciones.calls.reset();
    component.onCiudadChange('Abancay');
    const args = clienteServiceMock.getClientesProyecciones.calls.mostRecent().args;
    expect(args[3]).toBe('Abancay');
  });

  it('manual fecha rango triggers service call', () => {
    clienteServiceMock.getClientesProyecciones.calls.reset();
    component.onFechaDesdeChange('2025-01-01');
    component.onFechaHastaChange('2025-01-31');
    const args = clienteServiceMock.getClientesProyecciones.calls.mostRecent().args;
    expect(args[5]).toBe('2025-01-01');
    expect(args[6]).toBe('2025-01-31');
  });
});
