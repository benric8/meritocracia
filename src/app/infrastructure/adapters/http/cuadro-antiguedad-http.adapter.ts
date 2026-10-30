import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { from, map, Observable, switchMap, throwError } from 'rxjs';
import { tokenNiveles } from '../../../domain/commons/constants';
import {
  ArchivoDescargado,
  CuadroAntiguedad,
  FormatoDescargaCuadro,
} from '../../../domain/models/cuadro-antiguedad.model';
import { CuadroAntiguedadPort } from '../../../domain/ports/cuadro-antiguedad.port';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { environment } from '../../../../environments/environment';
import { assertRespuestaExitosa } from '../../api/api-response.util';
import { aArchivoDescargado, TIPOS_ARCHIVO_CUADRO } from '../../api/descarga-archivo.util';
import { mapearAErrorNegocioApi } from '../../api/mapear-error-negocio.operator';
import { cuadroAntiguedadEndpoints } from '../../api/reportes-api.constants';
import { CuadroAntiguedadResponse } from '../../dto/remote/CuadroAntiguedadResponse.dto';
import { toCuadroAntiguedad } from '../../mappers/cuadro-antiguedad.mapper';

const NOMBRE_ARCHIVO_POR_DEFECTO = 'cuadro-antiguedad-jueces-supremos';

@Injectable({ providedIn: 'root' })
export class CuadroAntiguedadHttpAdapter implements CuadroAntiguedadPort {
  private readonly http = inject(HttpClient);
  private readonly sesion = inject(SESION_PORT);

  private get baseUrl(): string {
    return environment.urlApi;
  }

  obtener(idFechaValoracion?: string): Observable<CuadroAntiguedad> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<CuadroAntiguedadResponse>(
        `${this.baseUrl}${cuadroAntiguedadEndpoints.JUECES_SUPREMOS}`,
        { params: this.parametros(idFechaValoracion) }
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return toCuadroAntiguedad(respuesta.data);
        }),
        mapearAErrorNegocioApi('No se pudo consultar el cuadro de antigüedad.')
      );
  }

  descargar(
    formato: FormatoDescargaCuadro,
    idFechaValoracion?: string
  ): Observable<ArchivoDescargado> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const { mime, extension } = TIPOS_ARCHIVO_CUADRO[formato];
    return this.http
      .get(`${this.baseUrl}${cuadroAntiguedadEndpoints.descarga(formato)}`, {
        params: this.parametros(idFechaValoracion),
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

  private parametros(idFechaValoracion?: string): HttpParams {
    const id = idFechaValoracion?.trim();
    return id ? new HttpParams().set('fecha_valoracion_id', id) : new HttpParams();
  }

  private asegurarTokenOpciones(): void {
    if (this.sesion.getTokenNivel() !== tokenNiveles.NIVEL_OPCIONES) {
      throw new Error('Se requiere una sesión con perfil cargado para consultar reportes.');
    }
  }
}
