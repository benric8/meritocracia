import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { tokenNiveles } from '../../../domain/commons/constants';
import { PeticionPaginada, ResultadoPaginado } from '../../../domain/models/paginacion.model';
import {
  FichaSuplencia,
  FiltrosSuplencias,
  MotivoSuplencia,
  RegistradorSuplente,
  SuplenciaAsignada,
} from '../../../domain/models/suplencia.model';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { SuplenciasPort } from '../../../domain/ports/suplencias.port';
import { environment } from '../../../../environments/environment';
import { assertRespuestaExitosa } from '../../api/api-response.util';
import { mapearAErrorNegocioApi } from '../../api/mapear-error-negocio.operator';
import { crearParametrosPaginacion } from '../../api/paginacion-http.util';
import { suplenciasEndpoints } from '../../api/suplencias-api.constants';
import { BaseResponse } from '../../dto/remote/BaseResponse,dto';
import {
  AsignarSuplenciaRequest,
  AsignarSuplenciaResponse,
  ListarSuplenciasResponse,
  MotivosSuplenciaResponse,
  RegistradoresSuplentesResponse,
} from '../../dto/remote/SuplenciaResponse.dto';
import { toResultadoPaginado } from '../../mappers/paginacion.mapper';
import {
  toFichaSuplencia,
  toMotivoSuplencia,
  toRegistradorSuplente,
  toSuplenciaAsignada,
} from '../../mappers/suplencia.mapper';

@Injectable({ providedIn: 'root' })
export class SuplenciasHttpAdapter implements SuplenciasPort {
  private readonly http = inject(HttpClient);
  private readonly sesion = inject(SESION_PORT);

  private get baseUrl(): string {
    return environment.urlApi;
  }

  listar(
    filtros: FiltrosSuplencias,
    paginacion: PeticionPaginada
  ): Observable<ResultadoPaginado<FichaSuplencia>> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    let params = crearParametrosPaginacion(paginacion);
    if (filtros.registradorTitularId != null) {
      params = params.set('registrador_titular_id', String(filtros.registradorTitularId));
    }
    const dni = filtros.dni.trim();
    if (dni) {
      params = params.set('dni', dni);
    }
    if (filtros.conSuplente != null) {
      params = params.set('con_suplente', String(filtros.conSuplente));
    }

    return this.http
      .get<ListarSuplenciasResponse>(`${this.baseUrl}${suplenciasEndpoints.LISTAR}`, { params })
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return toResultadoPaginado(respuesta, toFichaSuplencia);
        }),
        mapearAErrorNegocioApi('No se pudo consultar las suplencias.')
      );
  }

  listarRegistradores(): Observable<RegistradorSuplente[]> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<RegistradoresSuplentesResponse>(`${this.baseUrl}${suplenciasEndpoints.REGISTRADORES}`)
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return (respuesta.data ?? []).map(toRegistradorSuplente);
        }),
        mapearAErrorNegocioApi('No se pudo cargar la lista de registradores.')
      );
  }

  listarMotivos(): Observable<MotivoSuplencia[]> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<MotivosSuplenciaResponse>(`${this.baseUrl}${suplenciasEndpoints.MOTIVOS}`)
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return (respuesta.data ?? []).map(toMotivoSuplencia);
        }),
        mapearAErrorNegocioApi('No se pudo cargar los motivos de suplencia.')
      );
  }

  asignar(
    fichaId: string,
    registradorSuplenteId: number,
    motivo: string
  ): Observable<SuplenciaAsignada> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const body: AsignarSuplenciaRequest = { registradorSuplenteId, motivo };

    return this.http
      .put<AsignarSuplenciaResponse>(
        `${this.baseUrl}${suplenciasEndpoints.porFicha(fichaId)}`,
        body
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return toSuplenciaAsignada(respuesta.data);
        }),
        mapearAErrorNegocioApi('No se pudo asignar la suplencia.')
      );
  }

  retirar(fichaId: string): Observable<void> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .delete<BaseResponse>(`${this.baseUrl}${suplenciasEndpoints.porFicha(fichaId)}`)
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
        }),
        mapearAErrorNegocioApi('No se pudo retirar la suplencia.')
      );
  }

  private asegurarTokenOpciones(): void {
    if (this.sesion.getTokenNivel() !== tokenNiveles.NIVEL_OPCIONES) {
      throw new Error('Se requiere una sesión con perfil cargado para gestionar suplencias.');
    }
  }
}
