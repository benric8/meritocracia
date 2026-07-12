import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { USUARIOS_PORT } from '../../../domain/ports/usuarios.port';
import { MainLayout } from './main-layout';

describe('MainLayout', () => {
  let component: MainLayout;
  let fixture: ComponentFixture<MainLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [
        {
          provide: USUARIOS_PORT,
          useValue: {
            listar: () =>
              of({
                elementos: [],
                totalRegistros: 0,
                totalPaginas: 0,
                paginaActual: 1,
                tamanioPagina: 5,
              }),
            registrar: () => of(null),
            resetearClave: () => of(undefined),
            desactivar: () => of(undefined),
            cambiarContrasena: () => of(undefined),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
