import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { from, map, Observable, switchMap, throwError } from 'rxjs';
import { tokenNiveles } from '../../../domain/commons/constants';
import { CuadroMeritos, FiltrosCuadroMeritos } from '../../../domain/models/cuadro-meritos.model';
import {
  ArchivoDescargado,
  FormatoDescargaCuadro,
} from '../../../domain/models/reporte-descarga.model';
import { CuadroMeritosPort } from '../../../domain/ports/cuadro-meritos.port';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { environment } from '../../../../environments/environment';
import { assertRespuestaExitosa } from '../../api/api-response.util';
import { aArchivoDescargado, TIPOS_ARCHIVO_CUADRO } from '../../api/descarga-archivo.util';
import { mapearAErrorNegocioApi } from '../../api/mapear-error-negocio.operator';
import { cuadroMeritosEndpoints } from '../../api/reportes-api.constants';
import { CuadroMeritosResponse } from '../../dto/remote/CuadroMeritosResponse.dto';
import { toCuadroMeritos } from '../../mappers/cuadro-meritos.mapper';

/** Query param del API por cada filtro (consulta y descargas). */
const PARAMETROS_FILTRO: ReadonlyArray<[keyof FiltrosCuadroMeritos, string]> = [
  ['idFechaValoracion', 'fecha_valoracion_id'],
  ['idDistritoJudicial', 'distrito_judicial_id'],
  ['idEspecialidad', 'especialidad_id'],
  ['dni', 'numero_documento'],
  ['apellidosNombres', 'apellidos_nombres'],
  ['estadoCarrera', 'estado_carrera'],
];

const NOMBRE_ARCHIVO_POR_DEFECTO = 'cuadro-meritos-jueces-superiores';

@Injectable({ providedIn: 'root' })
export class CuadroMeritosHttpAdapter implements CuadroMeritosPort {
  private readonly http = inject(HttpClient);
  private readonly sesion = inject(SESION_PORT);

  private get baseUrl(): string {
    return environment.urlApi;
  }

  obtener(filtros: FiltrosCuadroMeritos): Observable<CuadroMeritos> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<CuadroMeritosResponse>(`${this.baseUrl}${cuadroMeritosEndpoints.JUECES_SUPERIORES}`, {
        params: this.parametros(filtros),
      })
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return toCuadroMeritos(respuesta.data);
        }),
        mapearAErrorNegocioApi('No se pudo consultar el cuadro de méritos.')
      );
  }

  descargar(
    formato: FormatoDescargaCuadro,
    filtros: FiltrosCuadroMeritos
  ): Observable<ArchivoDescargado> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const { mime, extension } = TIPOS_ARCHIVO_CUADRO[formato];
    return this.http
      .get(`${this.baseUrl}${cuadroMeritosEndpoints.descarga(formato)}`, {
        params: this.parametros(filtros),
        responseType: 'blob',
        observe: 'response',
        headers: { Accept: `${mime}, application/json` },
      })
      .pipe(
        switchMap((respuesta) =>
          from(aArchivoDescargado(respuesta, `${NOMBRE_ARCHIVO_POR_DEFECTO}.${extension}`))
        ),
        mapearAErrorNegocioApi('No se pudo descargar el cuadro de méritos.')
      );
  }

  /** Los vacíos se omiten: un `numero_documento=` fallaría la validación de 8 dígitos. */
  private parametros(filtros: FiltrosCuadroMeritos): HttpParams {
    let params = new HttpParams();
    for (const [campo, parametro] of PARAMETROS_FILTRO) {
      const valor = filtros[campo].trim();
      if (valor) {
        params = params.set(parametro, valor);
      }
    }
    return params;
  }

  private asegurarTokenOpciones(): void {
    if (this.sesion.getTokenNivel() !== tokenNiveles.NIVEL_OPCIONES) {
      throw new Error('Se requiere una sesión con perfil cargado para consultar reportes.');
    }
  }
}
