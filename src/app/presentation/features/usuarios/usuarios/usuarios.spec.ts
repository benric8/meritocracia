import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import { USUARIOS_PORT } from '../../../../domain/ports/usuarios.port';
import { crearAlertasPortMock } from '../../../../testing/alertas-port.mock';
import { Usuarios } from './usuarios';

const listadoUsuariosMock = {
  elementos: [],
  totalRegistros: 0,
  totalPaginas: 0,
  paginaActual: 1,
  tamanioPagina: 5,
};

describe('Usuarios', () => {
  let component: Usuarios;
  let fixture: ComponentFixture<Usuarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Usuarios],
      providers: [
        { provide: ALERTAS_PORT, useValue: crearAlertasPortMock() },
        {
          provide: USUARIOS_PORT,
          useValue: {
            listar: () => of(listadoUsuariosMock),
            registrar: () => of(null),
            resetearClave: () => of(undefined),
            desactivar: () => of(undefined),
            cambiarContrasena: () => of(undefined),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Usuarios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra el encabezado de gestión de usuarios', () => {
    const elemento: HTMLElement = fixture.nativeElement;
    expect(elemento.querySelector('.usuarios__titulo')?.textContent).toContain('Gestión de Usuarios');
  });
});
