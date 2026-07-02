import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fecha } from './fecha';

describe('Fecha', () => {
  let component: Fecha;
  let fixture: ComponentFixture<Fecha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fecha],
    }).compileComponents();

    fixture = TestBed.createComponent(Fecha);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
