import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { from, map, Observable, switchMap, throwError } from 'rxjs';
import { tokenNiveles } from '../../../domain/commons/constants';
import { ErrorNegocioApi } from '../../../domain/errors/error-negocio-api';
import {
  ArchivoDescargado,
  CuadroAntiguedad,
  FormatoDescargaCuadro,
} from '../../../domain/models/cuadro-antiguedad.model';
import { CuadroAntiguedadPort } from '../../../domain/ports/cuadro-antiguedad.port';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { environment } from '../../../../environments/environment';
import { esRespuestaApi } from '../../api/api-error.model';
import { assertRespuestaExitosa } from '../../api/api-response.util';
import { nombreArchivoDeContentDisposition } from '../../api/content-disposition.util';
import { detalleDesdeRespuestaApi } from '../../api/http-error.util';
import { mapearAErrorNegocioApi } from '../../api/mapear-error-negocio.operator';
import { cuadroAntiguedadEndpoints } from '../../api/reportes-api.constants';
import { CuadroAntiguedadResponse } from '../../dto/remote/CuadroAntiguedadResponse.dto';
import { toCuadroAntiguedad } from '../../mappers/cuadro-antiguedad.mapper';

const TIPOS_ARCHIVO: Record<FormatoDescargaCuadro, { mime: string; extension: string }> = {
  excel: {
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: 'xlsx',
  },
  pdf: { mime: 'application/pdf', extension: 'pdf' },
};

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

    const { mime, extension } = TIPOS_ARCHIVO[formato];
    return this.http
      .get(`${this.baseUrl}${cuadroAntiguedadEndpoints.descarga(formato)}`, {
        params: this.parametros(idFechaValoracion),
        responseType: 'blob',
        observe: 'response',
        headers: { Accept: `${mime}, application/json` },
      })
      .pipe(
        switchMap((respuesta) => from(this.aArchivo(respuesta, extension))),
        mapearAErrorNegocioApi('No se pudo descargar el cuadro de antigüedad.')
      );
  }

  /**
   * Los errores de negocio llegan con HTTP 200 y un `GlobalResponse` JSON en lugar
   * del archivo: sin esta revisión se guardaría un ".xlsx" que no abre.
   */
  private async aArchivo(
    respuesta: HttpResponse<Blob>,
    extension: string
  ): Promise<ArchivoDescargado> {
    const contenido = respuesta.body ?? new Blob();
    const tipo = respuesta.headers.get('Content-Type') ?? contenido.type;

    if (tipo.includes('application/json')) {
      let cuerpo: unknown = null;
      try {
        cuerpo = JSON.parse(await contenido.text());
      } catch {
        // Cuerpo no interpretable: se usa el mensaje por defecto.
      }
      throw new ErrorNegocioApi(
        esRespuestaApi(cuerpo)
          ? detalleDesdeRespuestaApi(cuerpo)
          : { mensaje: 'No se pudo generar el archivo.' }
      );
    }

    return {
      nombre:
        nombreArchivoDeContentDisposition(respuesta.headers.get('Content-Disposition')) ??
        `${NOMBRE_ARCHIVO_POR_DEFECTO}.${extension}`,
      contenido,
    };
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
