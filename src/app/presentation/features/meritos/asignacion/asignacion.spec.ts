import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Meritos } from './asignacion';

describe('Meritos', () => {
  let component: Meritos;
  let fixture: ComponentFixture<Meritos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Meritos],
    }).compileComponents();

    fixture = TestBed.createComponent(Meritos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
