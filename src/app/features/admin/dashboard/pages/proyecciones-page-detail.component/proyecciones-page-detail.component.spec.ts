import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProyeccionesPageDetailComponent } from './proyecciones-page-detail.component';

describe('ProyeccionesPageDetailComponent', () => {
  let component: ProyeccionesPageDetailComponent;
  let fixture: ComponentFixture<ProyeccionesPageDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProyeccionesPageDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProyeccionesPageDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
