import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActualizarDatosPersonalesFichaUseCase } from '../../../../application/use-cases/meritos/actualizar-datos-personales-ficha.use-case';
import { CalcularEdadJuezUseCase } from '../../../../application/use-cases/meritos/calcular-edad-juez.use-case';
import { CrearBorradorFichaUseCase } from '../../../../application/use-cases/meritos/crear-borrador-ficha.use-case';
import { ListarNivelesTitularUseCase } from '../../../../application/use-cases/meritos/listar-niveles-titular.use-case';
import { ObtenerDatosSigaJuezUseCase } from '../../../../application/use-cases/meritos/obtener-datos-siga-juez.use-case';
import { ObtenerFechaValoracionVigenteUseCase } from '../../../../application/use-cases/meritos/obtener-fecha-valoracion-vigente.use-case';
import { ObtenerFichaUseCase } from '../../../../application/use-cases/meritos/obtener-ficha.use-case';
import { ResolverFichaDelCicloUseCase } from '../../../../application/use-cases/meritos/resolver-ficha-del-ciclo.use-case';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import { Registro } from './registro';

describe('Registro', () => {
  let component: Registro;
  let fixture: ComponentFixture<Registro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Registro],
      providers: [
        {
          provide: ListarNivelesTitularUseCase,
          useValue: { ejecutar: () => of({ exito: true, niveles: [] }) },
        },
        {
          provide: ObtenerDatosSigaJuezUseCase,
          useValue: { ejecutar: () => of({ exito: false, mensaje: 'mock' }) },
        },
        {
          provide: CalcularEdadJuezUseCase,
          useValue: { ejecutar: () => of({ exito: false, mensaje: 'mock' }) },
        },
        {
          provide: ObtenerFechaValoracionVigenteUseCase,
          useValue: {
            ejecutar: () =>
              of({
                id: 'fv-test',
                fechaValoracion: '2026-12-31',
                anio: 2026,
                resolucion: 'RA-TEST',
                estado: 'VIGENTE',
                usuarioRegistro: 'TEST',
                fechaRegistro: '2026-01-01T00:00:00',
              }),
          },
        },
        {
          provide: ResolverFichaDelCicloUseCase,
          useValue: { ejecutar: () => of({ exito: true, resultado: { tipo: 'NUEVA' } }) },
        },
        {
          provide: CrearBorradorFichaUseCase,
          useValue: { ejecutar: () => of({ exito: false, mensaje: 'mock' }) },
        },
        {
          provide: ActualizarDatosPersonalesFichaUseCase,
          useValue: { ejecutar: () => of({ exito: false, mensaje: 'mock' }) },
        },
        {
          provide: ObtenerFichaUseCase,
          useValue: { ejecutar: () => of({ exito: false, mensaje: 'mock' }) },
        },
        {
          provide: ALERTAS_PORT,
          useValue: {
            error: () => Promise.resolve(),
            exito: () => Promise.resolve(),
            confirmar: () => Promise.resolve(false),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Registro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
