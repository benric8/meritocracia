import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CambiarEstadoFichaUseCase } from '../../../../application/use-cases/meritos/cambiar-estado-ficha.use-case';
import { ListarFichasValoracionUseCase } from '../../../../application/use-cases/meritos/listar-fichas-valoracion.use-case';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import { Consulta } from './consulta';

describe('Consulta', () => {
  let component: Consulta;
  let fixture: ComponentFixture<Consulta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Consulta],
      providers: [
        {
          provide: ListarFichasValoracionUseCase,
          useValue: {
            ejecutar: () =>
              of({
                elementos: [],
                totalRegistros: 0,
                totalPaginas: 0,
                paginaActual: 1,
                tamanioPagina: 10,
              }),
          },
        },
        { provide: CambiarEstadoFichaUseCase, useValue: { ejecutar: () => of({ exito: true }) } },
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

    fixture = TestBed.createComponent(Consulta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
