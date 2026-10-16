import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { tokenNiveles } from '../../../domain/commons/constants';
import { ErrorNegocioApi } from '../../../domain/errors/error-negocio-api';
import { FichaResumen, FiltrosConsultaFichas } from '../../../domain/models/ficha-consulta.model';
import { PeticionPaginada, ResultadoPaginado } from '../../../domain/models/paginacion.model';
import { FichasConsultaPort } from '../../../domain/ports/fichas-consulta.port';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { environment } from '../../../../environments/environment';
import { assertRespuestaExitosa } from '../../api/api-response.util';
import { fichaEndpoints } from '../../api/ficha-api.constants';
import { mapearAErrorNegocioApi } from '../../api/mapear-error-negocio.operator';
import { crearParametrosPaginacion } from '../../api/paginacion-http.util';
import { BaseResponse } from '../../dto/remote/BaseResponse,dto';
import {
  CambiarEstadoFichaRequest,
  ListarFichasResumenResponse,
} from '../../dto/remote/FichaResumenResponse.dto';
import { toFichaResumen } from '../../mappers/ficha-consulta.mapper';
import { toResultadoPaginado } from '../../mappers/paginacion.mapper';

@Injectable({ providedIn: 'root' })
export class FichasConsultaHttpAdapter implements FichasConsultaPort {
  private readonly http = inject(HttpClient);
  private readonly sesion = inject(SESION_PORT);

  private get baseUrl(): string {
    return environment.urlApi;
  }

  listar(
    filtros: FiltrosConsultaFichas,
    paginacion: PeticionPaginada
  ): Observable<ResultadoPaginado<FichaResumen>> {
    let registradorId: number;
    try {
      this.asegurarTokenOpciones();
      registradorId = this.obtenerRegistradorId();
    } catch (error) {
      return throwError(() => error);
    }

    let params = crearParametrosPaginacion(paginacion).set(
      'registrador_id',
      String(registradorId)
    );
    const dni = filtros.dni.trim();
    const apellidos = filtros.apellidos.trim();
    const nombres = filtros.nombres.trim();
    if (dni) {
      params = params.set('dni', dni);
    }
    if (apellidos) {
      params = params.set('apellidos', apellidos);
    }
    if (nombres) {
      params = params.set('nombres', nombres);
    }

    return this.http
      .get<ListarFichasResumenResponse>(`${this.baseUrl}${fichaEndpoints.LISTAR}`, { params })
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return toResultadoPaginado(respuesta, toFichaResumen);
        }),
        mapearAErrorNegocioApi('No se pudo consultar las fichas de valoración.')
      );
  }

  cambiarEstado(fichaId: string, activa: boolean): Observable<void> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const body: CambiarEstadoFichaRequest = { activo: activa ? '1' : '0' };

    return this.http
      .patch<BaseResponse>(`${this.baseUrl}${fichaEndpoints.estado(fichaId)}`, body)
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
        }),
        mapearAErrorNegocioApi('No se pudo cambiar el estado de la ficha.')
      );
  }

  private obtenerRegistradorId(): number {
    const id = this.sesion.getIdUsuarioAlmacenado();
    if (id == null || !Number.isFinite(id) || id <= 0) {
      throw new ErrorNegocioApi({
        mensaje: 'No se pudo identificar al registrador en sesión. Vuelva a iniciar sesión.',
      });
    }
    return id;
  }

  private asegurarTokenOpciones(): void {
    if (this.sesion.getTokenNivel() !== tokenNiveles.NIVEL_OPCIONES) {
      throw new Error('Se requiere una sesión con perfil cargado para consultar fichas.');
    }
  }
}
