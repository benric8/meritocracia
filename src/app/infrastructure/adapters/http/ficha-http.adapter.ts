import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { tokenNiveles } from '../../../domain/commons/constants';
import { ErrorNegocioApi } from '../../../domain/errors/error-negocio-api';
import {
  ActualizarDatosPersonalesFicha,
  CrearBorradorFicha,
  crearRubroAntiguedadVacio,
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
import { BaseResponse } from '../../dto/remote/BaseResponse,dto';
import {
  GuardarColegiaturaResponse,
  GuardarPeriodoInmediatoResponse,
  GuardarProvisionalidadResponse,
  GuardarTitularidadResponse,
} from '../../dto/remote/FichaAntiguedadResponse.dto';
import {
  CrearFichaResponse,
  FlujoFichaDto,
  FlujoFichaResponse,
} from '../../dto/remote/FichaResponse.dto';
import {
  aplicarColegiaturaEnFicha,
  aplicarPeriodoEnFicha,
  aplicarProvisionalidadEnFicha,
  aplicarTitularidadEnFicha,
  toGuardarColegiaturaRequestDto,
  toGuardarPeriodoInmediatoRequestDto,
  toGuardarProvisionalidadRequestDto,
  toGuardarTitularidadRequestDto,
} from '../../mappers/ficha-antiguedad.mapper';
import {
  toCrearFichaRequestDto,
  toFichaValoracionDesdeCreacion,
  toResultadoResolverFicha,
} from '../../mappers/ficha.mapper';

function esRespuestaEnvuelta(
  respuesta: FlujoFichaResponse | FlujoFichaDto
): respuesta is FlujoFichaResponse {
  return respuesta != null && typeof respuesta === 'object' && 'codigo' in respuesta;
}

@Injectable({ providedIn: 'root' })
export class FichaHttpAdapter implements FichaPort {
  private readonly http = inject(HttpClient);
  private readonly sesion = inject(SESION_PORT);
  /** Estado local de fichas del ciclo actual (el API aún no expone GET completo). */
  private readonly fichasEnMemoria = new Map<string, FichaValoracion>();

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
      .get<FlujoFichaResponse | FlujoFichaDto>(`${this.baseUrl}${fichaEndpoints.FLUJO}`, {
        params,
      })
      .pipe(
        map((respuesta) => toResultadoResolverFicha(this.extraerFlujoDto(respuesta))),
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
          const ficha = toFichaValoracionDesdeCreacion(respuesta.data, peticion);
          return this.guardarEnMemoria(ficha);
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

  obtenerPorId(fichaId: string): Observable<FichaValoracion> {
    const enMemoria = this.fichasEnMemoria.get(fichaId.trim());
    if (enMemoria) {
      return new Observable((subscriber) => {
        subscriber.next(enMemoria);
        subscriber.complete();
      });
    }

    return this.noImplementado('obtener ficha por id');
  }

  guardarTitularidad(fichaId: string, data: TitularidadActual): Observable<FichaValoracion> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    let body;
    try {
      body = toGuardarTitularidadRequestDto(fichaId, data);
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .post<GuardarTitularidadResponse>(`${this.baseUrl}${fichaEndpoints.ANTIGUEDAD}`, body)
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          if (!respuesta.data) {
            throw new ErrorNegocioApi({
              mensaje: 'El servidor no devolvió la antigüedad guardada.',
            });
          }
          const ficha = this.asegurarFichaEnMemoria(fichaId);
          return this.guardarEnMemoria(aplicarTitularidadEnFicha(ficha, data, respuesta.data));
        }),
        mapearAErrorNegocioApi('No se pudo guardar la titularidad.')
      );
  }

  guardarPeriodoNivelAnterior(
    fichaId: string,
    data: PeriodoNivelAnterior
  ): Observable<FichaValoracion> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const ficha = this.asegurarFichaEnMemoria(fichaId);
    const antiguedadId = ficha.rubroAntiguedad?.id?.trim() ?? '';
    if (!antiguedadId) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje:
              'Guarde primero la titularidad antes de registrar el periodo inmediato anterior.',
          })
      );
    }

    let body;
    try {
      body = toGuardarPeriodoInmediatoRequestDto(antiguedadId, data);
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .post<GuardarPeriodoInmediatoResponse>(
        `${this.baseUrl}${fichaEndpoints.PERIODO_INMEDIATO}`,
        body
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          if (!respuesta.data) {
            throw new ErrorNegocioApi({
              mensaje: 'El servidor no devolvió el periodo guardado.',
            });
          }
          return this.guardarEnMemoria(aplicarPeriodoEnFicha(ficha, data, respuesta.data));
        }),
        mapearAErrorNegocioApi('No se pudo guardar el periodo de nivel anterior.')
      );
  }

  upsertProvisionalidad(fichaId: string, item: Provisionalidad): Observable<FichaValoracion> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const ficha = this.asegurarFichaEnMemoria(fichaId);
    const antiguedadId = ficha.rubroAntiguedad?.id?.trim() ?? '';
    if (!antiguedadId) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje: 'Guarde primero la titularidad antes de registrar provisionalidades.',
          })
      );
    }

    let body;
    try {
      body = toGuardarProvisionalidadRequestDto(antiguedadId, item);
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .post<GuardarProvisionalidadResponse>(
        `${this.baseUrl}${fichaEndpoints.PROVISIONALIDAD}`,
        body
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          if (!respuesta.data) {
            throw new ErrorNegocioApi({
              mensaje: 'El servidor no devolvió la provisionalidad guardada.',
            });
          }
          return this.guardarEnMemoria(
            aplicarProvisionalidadEnFicha(ficha, item, respuesta.data)
          );
        }),
        mapearAErrorNegocioApi('No se pudo guardar la provisionalidad.')
      );
  }

  eliminarProvisionalidad(
    _fichaId: string,
    _itemId: string
  ): Observable<FichaValoracion> {
    return this.noImplementado('eliminar provisionalidad');
  }

  upsertColegiatura(fichaId: string, item: Colegiatura): Observable<FichaValoracion> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const ficha = this.asegurarFichaEnMemoria(fichaId);
    const antiguedadId = ficha.rubroAntiguedad?.id?.trim() ?? '';
    if (!antiguedadId) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje: 'Guarde primero la titularidad antes de registrar colegiaturas.',
          })
      );
    }

    let body;
    try {
      body = toGuardarColegiaturaRequestDto(antiguedadId, item);
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .post<GuardarColegiaturaResponse>(`${this.baseUrl}${fichaEndpoints.COLEGIATURA}`, body)
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          if (!respuesta.data) {
            throw new ErrorNegocioApi({
              mensaje: 'El servidor no devolvió la colegiatura guardada.',
            });
          }
          return this.guardarEnMemoria(aplicarColegiaturaEnFicha(ficha, item, respuesta.data));
        }),
        mapearAErrorNegocioApi('No se pudo guardar la colegiatura.')
      );
  }

  eliminarColegiatura(_fichaId: string, _itemId: string): Observable<FichaValoracion> {
    return this.noImplementado('eliminar colegiatura');
  }

  private extraerFlujoDto(respuesta: FlujoFichaResponse | FlujoFichaDto): FlujoFichaDto {
    if (esRespuestaEnvuelta(respuesta)) {
      assertRespuestaExitosa(respuesta as BaseResponse);
      if (!respuesta.data) {
        throw new ErrorNegocioApi({
          mensaje: 'El servidor no devolvió el flujo de la ficha.',
        });
      }
      return respuesta.data;
    }

    if (!respuesta?.flujo) {
      throw new ErrorNegocioApi({
        mensaje: 'El servidor no devolvió el flujo de la ficha.',
      });
    }

    return respuesta;
  }

  private asegurarFichaEnMemoria(fichaId: string): FichaValoracion {
    const id = fichaId.trim();
    const existente = this.fichasEnMemoria.get(id);
    if (existente) {
      return existente;
    }

    const ahora = new Date().toISOString();
    const stub: FichaValoracion = {
      id,
      estado: 'BORRADOR',
      nivelId: '',
      nivelNombre: '',
      fechaValoracionId: '',
      fechaValoracionSnapshot: '',
      datosPersonales: {
        dni: '',
        nombreCompleto: '',
        foto: '',
        fechaNacimiento: '',
        sexo: 'M',
        edad: null,
      },
      fichaPreviaId: null,
      rubroAntiguedad: crearRubroAntiguedadVacio(),
      puntajeTotal: 0,
      creadoEn: ahora,
      actualizadoEn: ahora,
    };
    this.fichasEnMemoria.set(id, stub);
    return stub;
  }

  private guardarEnMemoria(ficha: FichaValoracion): FichaValoracion {
    this.fichasEnMemoria.set(ficha.id, ficha);
    return ficha;
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
