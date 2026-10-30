import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { from, map, Observable, switchMap, throwError } from 'rxjs';
import { tokenNiveles } from '../../../domain/commons/constants';
import {
  CuadroAntiguedadSuperiores,
  FiltrosCuadroAntiguedadSuperiores,
} from '../../../domain/models/cuadro-antiguedad-superiores.model';
import {
  ArchivoDescargado,
  FormatoDescargaCuadro,
} from '../../../domain/models/reporte-descarga.model';
import { CuadroAntiguedadSuperioresPort } from '../../../domain/ports/cuadro-antiguedad-superiores.port';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { environment } from '../../../../environments/environment';
import { assertRespuestaExitosa } from '../../api/api-response.util';
import { aArchivoDescargado, TIPOS_ARCHIVO_CUADRO } from '../../api/descarga-archivo.util';
import { mapearAErrorNegocioApi } from '../../api/mapear-error-negocio.operator';
import { cuadroAntiguedadEndpoints } from '../../api/reportes-api.constants';
import { CuadroAntiguedadSuperioresResponse } from '../../dto/remote/CuadroAntiguedadSuperioresResponse.dto';
import { toCuadroAntiguedadSuperiores } from '../../mappers/cuadro-antiguedad-superiores.mapper';

/** Query param del API por cada filtro (consulta y descargas). */
const PARAMETROS_FILTRO: ReadonlyArray<[keyof FiltrosCuadroAntiguedadSuperiores, string]> = [
  ['idFechaValoracion', 'fecha_valoracion_id'],
  ['idDistritoJudicial', 'distrito_judicial_id'],
];

const NOMBRE_ARCHIVO_POR_DEFECTO = 'cuadro-antiguedad-jueces-superiores';

@Injectable({ providedIn: 'root' })
export class CuadroAntiguedadSuperioresHttpAdapter implements CuadroAntiguedadSuperioresPort {
  private readonly http = inject(HttpClient);
  private readonly sesion = inject(SESION_PORT);

  private get baseUrl(): string {
    return environment.urlApi;
  }

  obtener(filtros: FiltrosCuadroAntiguedadSuperiores): Observable<CuadroAntiguedadSuperiores> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<CuadroAntiguedadSuperioresResponse>(
        `${this.baseUrl}${cuadroAntiguedadEndpoints.JUECES_SUPERIORES}`,
        { params: this.parametros(filtros) }
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return toCuadroAntiguedadSuperiores(respuesta.data);
        }),
        mapearAErrorNegocioApi('No se pudo consultar el cuadro de antigüedad.')
      );
  }

  descargar(
    formato: FormatoDescargaCuadro,
    filtros: FiltrosCuadroAntiguedadSuperiores
  ): Observable<ArchivoDescargado> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const { mime, extension } = TIPOS_ARCHIVO_CUADRO[formato];
    return this.http
      .get(`${this.baseUrl}${cuadroAntiguedadEndpoints.descargaSuperiores(formato)}`, {
        params: this.parametros(filtros),
        responseType: 'blob',
        observe: 'response',
        headers: { Accept: `${mime}, application/json` },
      })
      .pipe(
        switchMap((respuesta) =>
          from(aArchivoDescargado(respuesta, `${NOMBRE_ARCHIVO_POR_DEFECTO}.${extension}`))
        ),
        mapearAErrorNegocioApi('No se pudo descargar el cuadro de antigüedad.')
      );
  }

  /** Los vacíos se omiten: sin `distrito_judicial_id` el backend devuelve el cuadro nacional. */
  private parametros(filtros: FiltrosCuadroAntiguedadSuperiores): HttpParams {
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
