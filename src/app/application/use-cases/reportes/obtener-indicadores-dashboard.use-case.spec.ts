import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { ErrorNegocioApi } from '../../../domain/errors/error-negocio-api';
import {
  FILTROS_DASHBOARD_RUBROS_VACIOS,
  IndicadorDashboardRubro,
  INDICADORES_DASHBOARD_RUBROS,
} from '../../../domain/models/dashboard-rubros.model';
import { DASHBOARD_RUBROS_PORT } from '../../../domain/ports/dashboard-rubros.port';
import { ObtenerIndicadoresDashboardUseCase } from './obtener-indicadores-dashboard.use-case';

describe('ObtenerIndicadoresDashboardUseCase', () => {
  function crear(obtenerIndicador: (indicador: IndicadorDashboardRubro) => unknown) {
    TestBed.configureTestingModule({
      providers: [{ provide: DASHBOARD_RUBROS_PORT, useValue: { obtenerIndicador } }],
    });
    return TestBed.inject(ObtenerIndicadoresDashboardUseCase);
  }

  it('resuelve cada indicador por separado aunque alguno falle', async () => {
    const useCase = crear((indicador) =>
      indicador === 'sexo'
        ? throwError(() => new ErrorNegocioApi({ mensaje: 'Error en sexo' }))
        : of({ indicador, descripcion: '', total: 10, series: [] })
    );

    const resultados = await firstValueFrom(useCase.ejecutar(FILTROS_DASHBOARD_RUBROS_VACIOS));

    expect(Object.keys(resultados)).toHaveLength(INDICADORES_DASHBOARD_RUBROS.length);
    expect(resultados['vigencia-documentos'].exito).toBe(true);
    expect(resultados.sexo).toEqual({ exito: false, detalle: { mensaje: 'Error en sexo' } });
    expect(resultados.demeritos.exito).toBe(true);
  });
});
