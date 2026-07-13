import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { tokenNiveles } from '../../../domain/commons/constants';
import {
  FechaValoracion,
  NuevaFechaValoracion,
} from '../../../domain/models/fecha-valoracion.model';
import { FechaValoracionPort } from '../../../domain/ports/fecha-valoracion.port';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { assertRespuestaExitosa } from '../../api/api-response.util';
import { fechaValoracionEndpoints } from '../../api/fecha-valoracion-api.constants';
import { mapearAErrorNegocioApi } from '../../api/mapear-error-negocio.operator';
import { getAppConfig } from '../../config/app-runtime-config';
import {
  FechaValoracionVigenteResponse,
  ListarFechasValoracionResponse,
  RegistrarFechaValoracionResponse,
} from '../../dto/remote/FechaValoracionResponse.dto';
import {
  toFechaValoracion,
  toRegistrarFechaValoracionRequestDto,
} from '../../mappers/fecha-valoracion.mapper';

@Injectable({ providedIn: 'root' })
export class FechaValoracionHttpAdapter implements FechaValoracionPort {
  private readonly http = inject(HttpClient);
  private readonly sesion = inject(SESION_PORT);

  private get baseUrl(): string {
    return getAppConfig().urlApi;
  }

  obtenerVigente(): Observable<FechaValoracion | null> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<FechaValoracionVigenteResponse>(`${this.baseUrl}${fechaValoracionEndpoints.VIGENTE}`)
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          if (!respuesta.data) {
            return null;
          }
          return toFechaValoracion(respuesta.data);
        }),
        mapearAErrorNegocioApi('No se pudo obtener la fecha de valoración vigente.')
      );
  }

  listarHistorial(): Observable<FechaValoracion[]> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<ListarFechasValoracionResponse>(
        `${this.baseUrl}${fechaValoracionEndpoints.HISTORIAL}`
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return (respuesta.data ?? [])
            .map((dto) => {
              try {
                return toFechaValoracion(dto);
              } catch {
                return null;
              }
            })
            .filter((item): item is FechaValoracion => item !== null);
        }),
        mapearAErrorNegocioApi('No se pudo listar el historial de fechas de valoración.')
      );
  }

  registrar(peticion: NuevaFechaValoracion, _usuario: string): Observable<FechaValoracion> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const body = toRegistrarFechaValoracionRequestDto(peticion);

    return this.http
      .post<RegistrarFechaValoracionResponse>(
        `${this.baseUrl}${fechaValoracionEndpoints.REGISTRAR}`,
        body
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return toFechaValoracion(respuesta.data);
        }),
        mapearAErrorNegocioApi('No se pudo registrar la fecha de valoración.')
      );
  }

  private asegurarTokenOpciones(): void {
    if (this.sesion.getTokenNivel() !== tokenNiveles.NIVEL_OPCIONES) {
      throw new Error(
        'Se requiere una sesión con perfil cargado para gestionar la fecha de valoración.'
      );
    }
  }
}
