import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CalcularEdadJuezUseCase } from '../../../../application/use-cases/meritos/calcular-edad-juez.use-case';
import { ListarNivelesTitularUseCase } from '../../../../application/use-cases/meritos/listar-niveles-titular.use-case';
import { ObtenerDatosSigaJuezUseCase } from '../../../../application/use-cases/meritos/obtener-datos-siga-juez.use-case';
import { ObtenerFechaValoracionVigenteUseCase } from '../../../../application/use-cases/meritos/obtener-fecha-valoracion-vigente.use-case';
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
                id: '1',
                fechaValoracion: '2025-12-31',
                anio: 2025,
                resolucion: 'RA-TEST',
                estado: 'VIGENTE',
                usuarioRegistro: 'TEST',
                fechaRegistro: '2025-01-01T00:00:00',
              }),
          },
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
