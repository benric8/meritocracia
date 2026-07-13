import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import { FECHA_VALORACION_PORT } from '../../../../domain/ports/fecha-valoracion.port';
import { SESION_PORT } from '../../../../domain/ports/sesion.port';
import { crearAlertasPortMock } from '../../../../testing/alertas-port.mock';
import { crearSesionPortMock } from '../../../../testing/sesion-port.mock';
import { Fecha } from './fecha';

const vigenteMock = {
  id: 'fv-1',
  fechaValoracion: '2026-07-02',
  anio: 2026,
  resolucion: 'Res. Admin. N° 045-2026-CEJ',
  estado: 'VIGENTE' as const,
  usuarioRegistro: 'Juan Pérez',
  fechaRegistro: '2026-07-01T15:30:00.000Z',
};

describe('Fecha', () => {
  let component: Fecha;
  let fixture: ComponentFixture<Fecha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fecha],
      providers: [
        { provide: ALERTAS_PORT, useValue: crearAlertasPortMock() },
        { provide: SESION_PORT, useValue: crearSesionPortMock() },
        {
          provide: FECHA_VALORACION_PORT,
          useValue: {
            obtenerVigente: () => of(vigenteMock),
            listarHistorial: () => of([vigenteMock]),
            registrar: () => of(vigenteMock),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Fecha);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra la configuración vigente', () => {
    const elemento: HTMLElement = fixture.nativeElement;
    expect(elemento.querySelector('.fecha-valoracion__titulo')?.textContent).toContain(
      'Configuración de Fecha de Valoración'
    );
    expect(elemento.querySelector('.fecha-valoracion__card-titulo')?.textContent).toContain(
      'Configuración vigente'
    );
    expect(elemento.textContent).toContain('02/07/2026');
  });
});
