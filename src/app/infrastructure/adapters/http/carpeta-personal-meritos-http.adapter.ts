import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { from, map, Observable, switchMap, throwError } from 'rxjs';
import { tokenNiveles } from '../../../domain/commons/constants';
import { CarpetaPersonalMeritos } from '../../../domain/models/carpeta-personal-meritos.model';
import { ArchivoDescargado } from '../../../domain/models/reporte-descarga.model';
import { CarpetaPersonalMeritosPort } from '../../../domain/ports/carpeta-personal-meritos.port';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { environment } from '../../../../environments/environment';
import { assertRespuestaExitosa } from '../../api/api-response.util';
import { aArchivoDescargado, TIPOS_ARCHIVO_CUADRO } from '../../api/descarga-archivo.util';
import { mapearAErrorNegocioApi } from '../../api/mapear-error-negocio.operator';
import { carpetaPersonalEndpoints } from '../../api/reportes-api.constants';
import { CarpetaPersonalMeritosResponse } from '../../dto/remote/CarpetaPersonalMeritosResponse.dto';
import { toCarpetaPersonalMeritos } from '../../mappers/carpeta-personal-meritos.mapper';

const NOMBRE_ARCHIVO_POR_DEFECTO = 'carpeta-personal-meritos';

@Injectable({ providedIn: 'root' })
export class CarpetaPersonalMeritosHttpAdapter implements CarpetaPersonalMeritosPort {
  private readonly http = inject(HttpClient);
  private readonly sesion = inject(SESION_PORT);

  private get baseUrl(): string {
    return environment.urlApi;
  }

  obtener(idFicha: string): Observable<CarpetaPersonalMeritos> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<CarpetaPersonalMeritosResponse>(
        `${this.baseUrl}${carpetaPersonalEndpoints.porId(idFicha)}`
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return toCarpetaPersonalMeritos(respuesta.data);
        }),
        mapearAErrorNegocioApi('No se pudo consultar la carpeta personal de méritos.')
      );
  }

  descargarPdf(idFicha: string): Observable<ArchivoDescargado> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const { mime, extension } = TIPOS_ARCHIVO_CUADRO.pdf;
    return this.http
      .get(`${this.baseUrl}${carpetaPersonalEndpoints.pdf(idFicha)}`, {
        responseType: 'blob',
        observe: 'response',
        headers: { Accept: `${mime}, application/json` },
      })
      .pipe(
        switchMap((respuesta) =>
          from(
            aArchivoDescargado(respuesta, `${NOMBRE_ARCHIVO_POR_DEFECTO}-${idFicha}.${extension}`)
          )
        ),
        mapearAErrorNegocioApi('No se pudo descargar la carpeta personal de méritos.')
      );
  }

  private asegurarTokenOpciones(): void {
    if (this.sesion.getTokenNivel() !== tokenNiveles.NIVEL_OPCIONES) {
      throw new Error('Se requiere una sesión con perfil cargado para consultar reportes.');
    }
  }
}
