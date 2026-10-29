import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ListarCatalogosDashboardUseCase } from '../../../../application/use-cases/reportes/listar-catalogos-dashboard.use-case';
import { ObtenerIndicadoresDashboardUseCase } from '../../../../application/use-cases/reportes/obtener-indicadores-dashboard.use-case';
import { INDICADORES_DASHBOARD_RUBROS } from '../../../../domain/models/dashboard-rubros.model';
import { ALERTAS_PORT } from '../../../../domain/ports/alertas.port';
import { GraficosRubros } from './graficos-rubros';

describe('GraficosRubros', () => {
  let fixture: ComponentFixture<GraficosRubros>;
  const obtenerIndicadores = { ejecutar: vi.fn() };
  const alertas = {
    error: vi.fn(() => Promise.resolve()),
    exito: () => Promise.resolve(),
    confirmar: () => Promise.resolve(false),
  };

  beforeEach(async () => {
    obtenerIndicadores.ejecutar.mockReset();
    alertas.error.mockClear();

    const resultados = Object.fromEntries(
      INDICADORES_DASHBOARD_RUBROS.map(({ indicador }) => [
        indicador,
        {
          exito: true,
          indicador: {
            indicador,
            descripcion: 'Descripción',
            total: 120,
            series: [
              {
                serie: 'TOTAL',
                total: 120,
                items: [{ clave: 'M', etiqueta: 'Masculino', cantidad: 70, porcentaje: 58.33 }],
              },
            ],
          },
        },
      ])
    );
    resultados['sexo'] = { exito: false, detalle: { mensaje: 'Fallo sexo' } } as never;
    obtenerIndicadores.ejecutar.mockReturnValue(of(resultados));

    await TestBed.configureTestingModule({
      imports: [GraficosRubros],
      providers: [
        {
          provide: ListarCatalogosDashboardUseCase,
          useValue: {
            ejecutar: () =>
              of({
                exito: true,
                catalogos: {
                  distritosJudiciales: [{ id: '1', nombre: 'LIMA' }],
                  especialidades: [{ id: '1', nombre: 'CIVIL' }],
                },
              }),
          },
        },
        { provide: ObtenerIndicadoresDashboardUseCase, useValue: obtenerIndicadores },
        { provide: ALERTAS_PORT, useValue: alertas },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GraficosRubros);
    await fixture.whenStable();
  });

  it('consulta todos los gráficos al iniciar sin filtros', () => {
    expect(obtenerIndicadores.ejecutar).toHaveBeenCalledTimes(1);
    expect(obtenerIndicadores.ejecutar.mock.calls[0][0]).toEqual({
      distritoJudicialId: '',
      nivelMagistradoId: '',
      especialidadId: '',
      estadoCarrera: '',
      fechaDesde: '',
      fechaHasta: '',
    });
  });

  it('muestra los gráficos de la pestaña activa y el error del que falló', () => {
    const html: HTMLElement = fixture.nativeElement;
    expect(html.querySelectorAll('app-grafico-indicador')).toHaveLength(7);
    expect(html.textContent).toContain('Fallo sexo');
    expect(html.textContent).toContain('Masculino');
  });

  it('muestra los indicadores de documentos en sus pestañas', async () => {
    const html: HTMLElement = fixture.nativeElement;
    const pestanas = Array.from(html.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    expect(pestanas).toHaveLength(4);
    expect(pestanas[2].textContent).toContain('Próximos a caducar');
    expect(pestanas[3].textContent).toContain('Caducados y vigentes');

    pestanas[3].click();
    await fixture.whenStable();

    const graficos = html.querySelectorAll('app-grafico-indicador');
    expect(graficos).toHaveLength(1);
    expect(graficos[0].textContent).toContain('Documentos caducados y no caducados');
    expect(pestanas[3].getAttribute('aria-selected')).toBe('true');
  });

  it('notifica una sola vez aunque fallen gráficos', () => {
    expect(alertas.error).toHaveBeenCalledTimes(1);
  });
});
