import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProyeccionesPageComponent } from './proyecciones-page.component';

describe('ProyeccionesPageComponent', () => {
  let component: ProyeccionesPageComponent;
  let fixture: ComponentFixture<ProyeccionesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProyeccionesPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProyeccionesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
