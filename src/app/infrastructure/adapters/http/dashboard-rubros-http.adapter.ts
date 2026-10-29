import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { tokenNiveles } from '../../../domain/commons/constants';
import {
  FiltrosDashboardRubros,
  IndicadorDashboard,
  IndicadorDashboardRubro,
} from '../../../domain/models/dashboard-rubros.model';
import { DashboardRubrosPort } from '../../../domain/ports/dashboard-rubros.port';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { environment } from '../../../../environments/environment';
import { assertRespuestaExitosa } from '../../api/api-response.util';
import { dashboardEndpoints } from '../../api/dashboard-api.constants';
import { mapearAErrorNegocioApi } from '../../api/mapear-error-negocio.operator';
import { IndicadorDashboardResponse } from '../../dto/remote/DashboardRubrosResponse.dto';
import { toIndicadorDashboard } from '../../mappers/dashboard-rubros.mapper';

/** Query param del API por cada filtro del dashboard. */
const PARAMETROS_FILTRO: ReadonlyArray<[keyof FiltrosDashboardRubros, string]> = [
  ['distritoJudicialId', 'distrito_judicial_id'],
  ['nivelMagistradoId', 'nivel_magistrado_id'],
  ['especialidadId', 'especialidad_id'],
  ['estadoCarrera', 'estado_carrera'],
  ['fechaDesde', 'fecha_desde'],
  ['fechaHasta', 'fecha_hasta'],
];

@Injectable({ providedIn: 'root' })
export class DashboardRubrosHttpAdapter implements DashboardRubrosPort {
  private readonly http = inject(HttpClient);
  private readonly sesion = inject(SESION_PORT);

  private get baseUrl(): string {
    return environment.urlApi;
  }

  obtenerIndicador(
    indicador: IndicadorDashboardRubro,
    filtros: FiltrosDashboardRubros
  ): Observable<IndicadorDashboard> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    let params = new HttpParams();
    for (const [campo, parametro] of PARAMETROS_FILTRO) {
      const valor = filtros[campo].trim();
      if (valor) {
        params = params.set(parametro, valor);
      }
    }

    return this.http
      .get<IndicadorDashboardResponse>(`${this.baseUrl}${dashboardEndpoints.rubro(indicador)}`, {
        params,
      })
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return toIndicadorDashboard(respuesta.data);
        }),
        mapearAErrorNegocioApi('No se pudo consultar el indicador del dashboard.')
      );
  }

  private asegurarTokenOpciones(): void {
    if (this.sesion.getTokenNivel() !== tokenNiveles.NIVEL_OPCIONES) {
      throw new Error('Se requiere una sesión con perfil cargado para consultar el dashboard.');
    }
  }
}
