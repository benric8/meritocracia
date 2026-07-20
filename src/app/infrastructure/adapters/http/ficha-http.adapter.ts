import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { tokenNiveles } from '../../../domain/commons/constants';
import { ErrorNegocioApi } from '../../../domain/errors/error-negocio-api';
import {
  ActualizarDatosPersonalesFicha,
  CrearBorradorFicha,
  FichaValoracion,
  ResultadoResolverFicha,
} from '../../../domain/models/ficha-valoracion.model';
import {
  Colegiatura,
  PeriodoNivelAnterior,
  Provisionalidad,
  TitularidadActual,
} from '../../../domain/models/rubro-antiguedad.model';
import { FichaPort } from '../../../domain/ports/ficha.port';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { assertRespuestaExitosa } from '../../api/api-response.util';
import { fichaEndpoints } from '../../api/ficha-api.constants';
import { mapearAErrorNegocioApi } from '../../api/mapear-error-negocio.operator';
import { getAppConfig } from '../../config/app-runtime-config';
import {
  CrearFichaResponse,
  FlujoFichaResponse,
} from '../../dto/remote/FichaResponse.dto';
import {
  toCrearFichaRequestDto,
  toFichaValoracionDesdeCreacion,
  toResultadoResolverFicha,
} from '../../mappers/ficha.mapper';

@Injectable({ providedIn: 'root' })
export class FichaHttpAdapter implements FichaPort {
  private readonly http = inject(HttpClient);
  private readonly sesion = inject(SESION_PORT);

  private get baseUrl(): string {
    return getAppConfig().urlApi;
  }

  resolverDelCiclo(dni: string, fechaValoracionId: string): Observable<ResultadoResolverFicha> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    let registradorId: number;
    try {
      registradorId = this.obtenerRegistradorId();
    } catch (error) {
      return throwError(() => error);
    }

    const params = new HttpParams()
      .set('dni', dni.trim())
      .set('fecha_valoracion_id', fechaValoracionId.trim())
      .set('registrador_id', String(registradorId));

    return this.http
      .get<FlujoFichaResponse>(`${this.baseUrl}${fichaEndpoints.FLUJO}`, { params })
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          if (!respuesta.data) {
            throw new ErrorNegocioApi({
              mensaje: 'El servidor no devolvió el flujo de la ficha.',
            });
          }
          return toResultadoResolverFicha(respuesta.data);
        }),
        mapearAErrorNegocioApi('No se pudo resolver el flujo de la ficha.')
      );
  }

  crearBorrador(peticion: CrearBorradorFicha): Observable<FichaValoracion> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    let registradorId: number;
    let body;
    try {
      registradorId = this.obtenerRegistradorId();
      body = toCrearFichaRequestDto(peticion, registradorId);
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .post<CrearFichaResponse>(`${this.baseUrl}${fichaEndpoints.CREAR}`, body)
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          if (!respuesta.data) {
            throw new ErrorNegocioApi({
              mensaje: 'El servidor no devolvió la ficha creada.',
            });
          }
          return toFichaValoracionDesdeCreacion(respuesta.data, peticion);
        }),
        mapearAErrorNegocioApi('No se pudo crear la ficha.')
      );
  }

  actualizarDatosPersonales(
    _fichaId: string,
    _peticion: ActualizarDatosPersonalesFicha
  ): Observable<FichaValoracion> {
    return this.noImplementado('actualizar datos personales');
  }

  obtenerPorId(_fichaId: string): Observable<FichaValoracion> {
    return this.noImplementado('obtener ficha por id');
  }

  guardarTitularidad(
    _fichaId: string,
    _data: TitularidadActual
  ): Observable<FichaValoracion> {
    return this.noImplementado('guardar titularidad');
  }

  guardarPeriodoNivelAnterior(
    _fichaId: string,
    _data: PeriodoNivelAnterior
  ): Observable<FichaValoracion> {
    return this.noImplementado('guardar periodo nivel anterior');
  }

  upsertProvisionalidad(
    _fichaId: string,
    _item: Provisionalidad
  ): Observable<FichaValoracion> {
    return this.noImplementado('guardar provisionalidad');
  }

  eliminarProvisionalidad(
    _fichaId: string,
    _itemId: string
  ): Observable<FichaValoracion> {
    return this.noImplementado('eliminar provisionalidad');
  }

  upsertColegiatura(_fichaId: string, _item: Colegiatura): Observable<FichaValoracion> {
    return this.noImplementado('guardar colegiatura');
  }

  eliminarColegiatura(_fichaId: string, _itemId: string): Observable<FichaValoracion> {
    return this.noImplementado('eliminar colegiatura');
  }

  private noImplementado(operacion: string): Observable<FichaValoracion> {
    return throwError(
      () =>
        new ErrorNegocioApi({
          mensaje: `La operación "${operacion}" aún no está disponible en el API.`,
        })
    );
  }

  private obtenerRegistradorId(): number {
    const id = this.sesion.getIdUsuarioAlmacenado();
    if (id == null || !Number.isFinite(id) || id <= 0) {
      throw new ErrorNegocioApi({
        mensaje:
          'No se pudo identificar al registrador en sesión. Vuelva a iniciar sesión.',
      });
    }
    return id;
  }

  private asegurarTokenOpciones(): void {
    if (this.sesion.getTokenNivel() !== tokenNiveles.NIVEL_OPCIONES) {
      throw new Error(
        'Se requiere una sesión con perfil cargado para gestionar fichas.'
      );
    }
  }
}
