import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import {
  FiltrosDashboardRubros,
  IndicadorDashboard,
  IndicadorDashboardRubro,
  INDICADORES_DASHBOARD_RUBROS,
} from '../../../domain/models/dashboard-rubros.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { DASHBOARD_RUBROS_PORT } from '../../../domain/ports/dashboard-rubros.port';

export type ResultadoIndicadorDashboard =
  | { exito: true; indicador: IndicadorDashboard }
  | { exito: false; detalle: DetalleError };

export type ResultadosIndicadoresDashboard = Record<
  IndicadorDashboardRubro,
  ResultadoIndicadorDashboard
>;

/**
 * Consulta en paralelo todos los gráficos del dashboard con los mismos filtros.
 * Cada indicador resuelve por separado: un fallo no impide mostrar los demás.
 */
@Injectable({ providedIn: 'root' })
export class ObtenerIndicadoresDashboardUseCase {
  private readonly dashboard = inject(DASHBOARD_RUBROS_PORT);

  ejecutar(filtros: FiltrosDashboardRubros): Observable<ResultadosIndicadoresDashboard> {
    const consultas = Object.fromEntries(
      INDICADORES_DASHBOARD_RUBROS.map(({ indicador }) => [
        indicador,
        this.dashboard.obtenerIndicador(indicador, filtros).pipe(
          map((datos): ResultadoIndicadorDashboard => ({ exito: true, indicador: datos })),
          catchError((error) =>
            of<ResultadoIndicadorDashboard>({
              exito: false,
              detalle: aDetalleError(error, 'No se pudo cargar el gráfico.'),
            })
          )
        ),
      ])
    ) as Record<IndicadorDashboardRubro, Observable<ResultadoIndicadorDashboard>>;

    return forkJoin(consultas);
  }
}
