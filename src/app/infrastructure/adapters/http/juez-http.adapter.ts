import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { tokenNiveles } from '../../../domain/commons/constants';
import {
  CalculoEdadJuez,
  DatosSigaJuez,
  EdadJuez,
} from '../../../domain/models/datos-siga-juez.model';
import { JuezPort } from '../../../domain/ports/juez.port';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { assertRespuestaExitosa } from '../../api/api-response.util';
import { juezEndpoints } from '../../api/juez-api.constants';
import { mapearAErrorNegocioApi } from '../../api/mapear-error-negocio.operator';
import { getAppConfig } from '../../config/app-runtime-config';
import {
  DatosSigaJuezResponse,
  EdadJuezResponse,
} from '../../dto/remote/JuezResponse.dto';
import {
  toCalcularEdadJuezRequestDto,
  toDatosSigaJuez,
  toEdadJuez,
} from '../../mappers/juez.mapper';

@Injectable({ providedIn: 'root' })
export class JuezHttpAdapter implements JuezPort {
  private readonly http = inject(HttpClient);
  private readonly sesion = inject(SESION_PORT);

  private get baseUrl(): string {
    return getAppConfig().urlApi;
  }

  obtenerDatosSiga(dni: string): Observable<DatosSigaJuez> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const params = new HttpParams().set('numero_documento', dni.trim());

    return this.http
      .get<DatosSigaJuezResponse>(`${this.baseUrl}${juezEndpoints.DATOS_SIGA}`, {
        params,
      })
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return toDatosSigaJuez(respuesta.data ?? {});
        }),
        mapearAErrorNegocioApi('No se pudo obtener los datos del juez en SIGA.')
      );
  }

  calcularEdad(peticion: CalculoEdadJuez): Observable<EdadJuez> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const body = toCalcularEdadJuezRequestDto(peticion);
    const params = new HttpParams()
      .set('fechaNacimiento', body.fechaNacimiento)
      .set('fechaValoracion', body.fechaValoracion);

    return this.http
      .get<EdadJuezResponse>(`${this.baseUrl}${juezEndpoints.EDAD}`, { params })
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return toEdadJuez(respuesta.data);
        }),
        mapearAErrorNegocioApi('No se pudo calcular la edad del juez.')
      );
  }

  private asegurarTokenOpciones(): void {
    if (this.sesion.getTokenNivel() !== tokenNiveles.NIVEL_OPCIONES) {
      throw new Error(
        'Se requiere una sesión con perfil cargado para consultar datos del juez.'
      );
    }
  }
}
