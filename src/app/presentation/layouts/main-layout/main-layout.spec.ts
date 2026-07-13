import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ALERTAS_PORT } from '../../../domain/ports/alertas.port';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { USUARIOS_PORT } from '../../../domain/ports/usuarios.port';
import { crearAlertasPortMock } from '../../../testing/alertas-port.mock';
import { crearSesionPortMock } from '../../../testing/sesion-port.mock';
import { MainLayout } from './main-layout';

describe('MainLayout', () => {
  let component: MainLayout;
  let fixture: ComponentFixture<MainLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [
        provideRouter([]),
        { provide: ALERTAS_PORT, useValue: crearAlertasPortMock() },
        { provide: SESION_PORT, useValue: crearSesionPortMock() },
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
