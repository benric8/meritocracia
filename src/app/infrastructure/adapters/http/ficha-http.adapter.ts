import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { tokenNiveles } from '../../../domain/commons/constants';
import { ErrorNegocioApi } from '../../../domain/errors/error-negocio-api';
import {
  ActualizarDatosPersonalesFicha,
  CrearBorradorFicha,
  crearRubroAntiguedadVacio,
  crearRubroAmagVacio,
  crearRubroGradosTitulosVacio,
  FichaValoracion,
  ResultadoResolverFicha,
} from '../../../domain/models/ficha-valoracion.model';
import {
  Colegiatura,
  PeriodoNivelAnterior,
  Provisionalidad,
  RubroAntiguedad,
  TitularidadActual,
} from '../../../domain/models/rubro-antiguedad.model';
import { GradoTitulo, RubroGradosTitulos } from '../../../domain/models/rubro-grados-titulos.model';
import { EstudioAmag, RubroAmag } from '../../../domain/models/rubro-amag.model';
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
  EliminarAntiguedadItemResponse,
  ObtenerAntiguedadResponse,
} from '../../dto/remote/FichaAntiguedadResponse.dto';
import {
  EliminarGradoTituloResponse,
  GuardarGradoTituloResponse,
  ObtenerGradosTitulosResponse,
} from '../../dto/remote/FichaGradosTitulosResponse.dto';
import {
  EliminarEstudioAmagResponse,
  GuardarEstudioAmagResponse,
  ObtenerEstudiosAmagResponse,
} from '../../dto/remote/FichaAmagResponse.dto';
import {
  CrearFichaResponse,
  FlujoFichaDto,
  FlujoFichaResponse,
  ObtenerFichaResponse,
} from '../../dto/remote/FichaResponse.dto';
import {
  aplicarColegiaturaEnFicha,
  aplicarPeriodoEnFicha,
  aplicarProvisionalidadEnFicha,
  aplicarTitularidadEnFicha,
  eliminarColegiaturaEnFicha,
  eliminarProvisionalidadEnFicha,
  esIdPersistidoApi,
  toGuardarColegiaturaRequestDto,
  toGuardarPeriodoInmediatoRequestDto,
  toGuardarProvisionalidadRequestDto,
  toGuardarTitularidadRequestDto,
  toRubroAntiguedadDesdeDetalle,
} from '../../mappers/ficha-antiguedad.mapper';
import {
  aplicarGradoTituloEnFicha,
  eliminarGradoTituloEnFicha,
  toGuardarGradoTituloRequestDto,
  toRubroGradosTitulosDesdeDetalle,
} from '../../mappers/ficha-grados-titulos.mapper';
import {
  aplicarEstudioAmagEnFicha,
  eliminarEstudioAmagEnFicha,
  toGuardarEstudioAmagRequestDto,
  toRubroAmagDesdeDetalle,
} from '../../mappers/ficha-amag.mapper';
import {
  toCrearFichaRequestDto,
  toFichaValoracionDesdeCreacion,
  toFichaValoracionDesdeDetalle,
  toResultadoResolverFicha,
} from '../../mappers/ficha.mapper';
import { RubrosMaestroStore } from '../../stores/rubros-maestro.store';

function esRespuestaEnvuelta(
  respuesta: FlujoFichaResponse | FlujoFichaDto
): respuesta is FlujoFichaResponse {
  return respuesta != null && typeof respuesta === 'object' && 'codigo' in respuesta;
}

@Injectable({ providedIn: 'root' })
export class FichaHttpAdapter implements FichaPort {
  private readonly http = inject(HttpClient);
  private readonly sesion = inject(SESION_PORT);
  private readonly rubrosMaestro = inject(RubrosMaestroStore);
  /** Cache local para mutaciones de rubros tras crear/obtener la ficha. */
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
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const id = fichaId.trim();
    if (!id) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje: 'Identificador de ficha no válido.',
          })
      );
    }

    let registradorId: number;
    try {
      registradorId = this.obtenerRegistradorId();
    } catch (error) {
      return throwError(() => error);
    }

    const params = new HttpParams().set('registrador_id', String(registradorId));

    return this.http
      .get<ObtenerFichaResponse>(`${this.baseUrl}${fichaEndpoints.porId(id)}`, { params })
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          if (!respuesta.data) {
            throw new ErrorNegocioApi({
              mensaje: 'El servidor no devolvió la ficha.',
            });
          }
          const ficha = toFichaValoracionDesdeDetalle(respuesta.data);
          return this.fusionarConMemoria(ficha);
        }),
        mapearAErrorNegocioApi('No se pudo obtener la ficha.')
      );
  }

  obtenerRubroAntiguedad(fichaId: string): Observable<RubroAntiguedad> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const id = fichaId.trim();
    if (!id) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje: 'Identificador de ficha no válido.',
          })
      );
    }

    let registradorId: number;
    try {
      registradorId = this.obtenerRegistradorId();
    } catch (error) {
      return throwError(() => error);
    }

    const params = new HttpParams()
      .set('ficha_valoracion_id', id)
      .set('registrador_id', String(registradorId));

    return this.http
      .get<ObtenerAntiguedadResponse>(`${this.baseUrl}${fichaEndpoints.ANTIGUEDAD}`, { params })
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          if (!respuesta.data) {
            throw new ErrorNegocioApi({
              mensaje: 'El servidor no devolvió el rubro de antigüedad.',
            });
          }
          const rubro = toRubroAntiguedadDesdeDetalle(respuesta.data);
          this.actualizarRubroEnMemoria(id, rubro);
          return rubro;
        }),
        mapearAErrorNegocioApi('No se pudo obtener el rubro de antigüedad.')
      );
  }

  guardarTitularidad(
    fichaId: string,
    data: TitularidadActual,
    antiguedadId?: string | null
  ): Observable<FichaValoracion> {
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

    const idAntiguedad = antiguedadId?.trim() ?? '';
    const url = idAntiguedad
      ? `${this.baseUrl}${fichaEndpoints.antiguedadPorId(idAntiguedad)}`
      : `${this.baseUrl}${fichaEndpoints.ANTIGUEDAD}`;

    const request$ = idAntiguedad
      ? this.http.put<GuardarTitularidadResponse>(url, body)
      : this.http.post<GuardarTitularidadResponse>(url, body);

    return request$.pipe(
      map((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (!respuesta.data) {
          throw new ErrorNegocioApi({
            mensaje: idAntiguedad
              ? 'El servidor no devolvió la titularidad actualizada.'
              : 'El servidor no devolvió la antigüedad guardada.',
          });
        }
        const ficha = this.asegurarFichaEnMemoria(fichaId);
        return this.guardarEnMemoria(aplicarTitularidadEnFicha(ficha, data, respuesta.data));
      }),
      mapearAErrorNegocioApi(
        idAntiguedad ? 'No se pudo actualizar la titularidad.' : 'No se pudo guardar la titularidad.'
      )
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

    const periodoId = data.id?.trim() ?? '';
    const esActualizacion = esIdPersistidoApi(periodoId);
    const url = esActualizacion
      ? `${this.baseUrl}${fichaEndpoints.periodoInmediatoPorId(periodoId)}`
      : `${this.baseUrl}${fichaEndpoints.PERIODO_INMEDIATO}`;

    const request$ = esActualizacion
      ? this.http.put<GuardarPeriodoInmediatoResponse>(url, body)
      : this.http.post<GuardarPeriodoInmediatoResponse>(url, body);

    return request$.pipe(
      map((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (!respuesta.data) {
          throw new ErrorNegocioApi({
            mensaje: esActualizacion
              ? 'El servidor no devolvió el periodo actualizado.'
              : 'El servidor no devolvió el periodo guardado.',
          });
        }
        return this.guardarEnMemoria(aplicarPeriodoEnFicha(ficha, data, respuesta.data));
      }),
      mapearAErrorNegocioApi(
        esActualizacion
          ? 'No se pudo actualizar el periodo de nivel anterior.'
          : 'No se pudo guardar el periodo de nivel anterior.'
      )
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

    const itemId = item.id?.trim() ?? '';
    const esActualizacion = esIdPersistidoApi(itemId);
    const url = esActualizacion
      ? `${this.baseUrl}${fichaEndpoints.provisionalidadPorId(itemId)}`
      : `${this.baseUrl}${fichaEndpoints.PROVISIONALIDAD}`;

    const request$ = esActualizacion
      ? this.http.put<GuardarProvisionalidadResponse>(url, body)
      : this.http.post<GuardarProvisionalidadResponse>(url, body);

    return request$.pipe(
      map((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (!respuesta.data) {
          throw new ErrorNegocioApi({
            mensaje: esActualizacion
              ? 'El servidor no devolvió la provisionalidad actualizada.'
              : 'El servidor no devolvió la provisionalidad guardada.',
          });
        }
        return this.guardarEnMemoria(
          aplicarProvisionalidadEnFicha(ficha, item, respuesta.data)
        );
      }),
      mapearAErrorNegocioApi(
        esActualizacion ? 'No se pudo actualizar la provisionalidad.' : 'No se pudo guardar la provisionalidad.'
      )
    );
  }

  eliminarProvisionalidad(
    fichaId: string,
    itemId: string
  ): Observable<FichaValoracion> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const idItem = itemId?.trim() ?? '';
    if (!esIdPersistidoApi(idItem)) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje: 'Identificador de provisionalidad no válido.',
          })
      );
    }

    const ficha = this.asegurarFichaEnMemoria(fichaId);
    const url = `${this.baseUrl}${fichaEndpoints.provisionalidadPorId(idItem)}`;

    return this.http.delete<EliminarAntiguedadItemResponse>(url).pipe(
      map((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (respuesta.data?.antiguedad) {
          const rubro = toRubroAntiguedadDesdeDetalle(respuesta.data);
          return this.guardarEnMemoria({
            ...ficha,
            rubroAntiguedad: rubro,
            puntajeTotal: rubro.titularidad.puntaje,
            actualizadoEn: new Date().toISOString(),
          });
        }
        return this.guardarEnMemoria(eliminarProvisionalidadEnFicha(ficha, idItem));
      }),
      mapearAErrorNegocioApi('No se pudo eliminar la provisionalidad.')
    );
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

    const itemId = item.id?.trim() ?? '';
    const esActualizacion = esIdPersistidoApi(itemId);
    const url = esActualizacion
      ? `${this.baseUrl}${fichaEndpoints.colegiaturaPorId(itemId)}`
      : `${this.baseUrl}${fichaEndpoints.COLEGIATURA}`;

    const request$ = esActualizacion
      ? this.http.put<GuardarColegiaturaResponse>(url, body)
      : this.http.post<GuardarColegiaturaResponse>(url, body);

    return request$.pipe(
      map((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (!respuesta.data) {
          throw new ErrorNegocioApi({
            mensaje: esActualizacion
              ? 'El servidor no devolvió la colegiatura actualizada.'
              : 'El servidor no devolvió la colegiatura guardada.',
          });
        }
        return this.guardarEnMemoria(aplicarColegiaturaEnFicha(ficha, item, respuesta.data));
      }),
      mapearAErrorNegocioApi(
        esActualizacion ? 'No se pudo actualizar la colegiatura.' : 'No se pudo guardar la colegiatura.'
      )
    );
  }

  eliminarColegiatura(fichaId: string, itemId: string): Observable<FichaValoracion> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const idItem = itemId?.trim() ?? '';
    if (!esIdPersistidoApi(idItem)) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje: 'Identificador de colegiatura no válido.',
          })
      );
    }

    const ficha = this.asegurarFichaEnMemoria(fichaId);
    const url = `${this.baseUrl}${fichaEndpoints.colegiaturaPorId(idItem)}`;

    return this.http.delete<EliminarAntiguedadItemResponse>(url).pipe(
      map((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (respuesta.data?.antiguedad) {
          const rubro = toRubroAntiguedadDesdeDetalle(respuesta.data);
          return this.guardarEnMemoria({
            ...ficha,
            rubroAntiguedad: rubro,
            actualizadoEn: new Date().toISOString(),
          });
        }
        return this.guardarEnMemoria(eliminarColegiaturaEnFicha(ficha, idItem));
      }),
      mapearAErrorNegocioApi('No se pudo eliminar la colegiatura.')
    );
  }

  obtenerRubroGradosTitulos(fichaId: string): Observable<RubroGradosTitulos> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const id = fichaId.trim();
    if (!id) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje: 'Identificador de ficha no válido.',
          })
      );
    }

    let registradorId: number;
    try {
      registradorId = this.obtenerRegistradorId();
    } catch (error) {
      return throwError(() => error);
    }

    const params = new HttpParams()
      .set('ficha_valoracion_id', id)
      .set('registrador_id', String(registradorId));

    return this.http
      .get<ObtenerGradosTitulosResponse>(`${this.baseUrl}${fichaEndpoints.GRADOS_TITULOS}`, {
        params,
      })
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          const rubro = toRubroGradosTitulosDesdeDetalle(respuesta.data);
          this.actualizarRubroGradosEnMemoria(id, rubro);
          return rubro;
        }),
        mapearAErrorNegocioApi('No se pudo obtener el rubro de grados y títulos.')
      );
  }

  upsertGradoTitulo(fichaId: string, item: GradoTitulo): Observable<FichaValoracion> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const ficha = this.asegurarFichaEnMemoria(fichaId);
    const itemId = item.id?.trim() ?? '';
    const esActualizacion = esIdPersistidoApi(itemId);

    let body;
    let rubroId: number;
    try {
      rubroId = this.obtenerIdRubroGradosTitulos();
      body = toGuardarGradoTituloRequestDto(
        fichaId,
        {
          gradoAcademicoId: item.gradoAcademicoId,
          universidadId: item.universidadId,
          paisId: item.paisId,
          fechaObtencion: item.fechaObtencion,
          especialidad: item.especialidad,
          mencion: item.mencion,
          observacion: item.observacion,
        },
        rubroId,
        !esActualizacion
      );
    } catch (error) {
      return throwError(() => error);
    }

    const url = esActualizacion
      ? `${this.baseUrl}${fichaEndpoints.gradoTituloPorId(itemId)}`
      : `${this.baseUrl}${fichaEndpoints.GRADOS_TITULOS}`;

    const request$ = esActualizacion
      ? this.http.put<GuardarGradoTituloResponse>(url, body)
      : this.http.post<GuardarGradoTituloResponse>(url, body);

    return request$.pipe(
      map((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (!respuesta.data) {
          throw new ErrorNegocioApi({
            mensaje: esActualizacion
              ? 'El servidor no devolvió el grado actualizado.'
              : 'El servidor no devolvió el grado guardado.',
          });
        }
        return this.guardarEnMemoria(aplicarGradoTituloEnFicha(ficha, item, respuesta.data));
      }),
      mapearAErrorNegocioApi(
        esActualizacion ? 'No se pudo actualizar el grado.' : 'No se pudo guardar el grado.'
      )
    );
  }

  eliminarGradoTitulo(fichaId: string, itemId: string): Observable<FichaValoracion> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const idItem = itemId?.trim() ?? '';
    if (!esIdPersistidoApi(idItem)) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje: 'Identificador de grado no válido.',
          })
      );
    }

    const ficha = this.asegurarFichaEnMemoria(fichaId);
    let rubroId: number;
    try {
      rubroId = this.obtenerIdRubroGradosTitulos();
    } catch (error) {
      return throwError(() => error);
    }

    const params = new HttpParams().set('rubro_id', String(rubroId));
    const url = `${this.baseUrl}${fichaEndpoints.gradoTituloPorId(idItem)}`;

    return this.http.delete<EliminarGradoTituloResponse>(url, { params }).pipe(
      map((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (respuesta.data) {
          const rubro = toRubroGradosTitulosDesdeDetalle(respuesta.data);
          return this.guardarEnMemoria({
            ...ficha,
            rubroGradosTitulos: rubro,
            actualizadoEn: new Date().toISOString(),
          });
        }
        return this.guardarEnMemoria(eliminarGradoTituloEnFicha(ficha, idItem));
      }),
      mapearAErrorNegocioApi('No se pudo eliminar el grado.')
    );
  }

  obtenerRubroAmag(fichaId: string): Observable<RubroAmag> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const id = fichaId?.trim() ?? '';
    if (!id) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje: 'Identificador de ficha no válido.',
          })
      );
    }

    let registradorId: number;
    try {
      registradorId = this.obtenerRegistradorId();
    } catch (error) {
      return throwError(() => error);
    }

    const params = new HttpParams()
      .set('ficha_valoracion_id', id)
      .set('registrador_id', String(registradorId));

    return this.http
      .get<ObtenerEstudiosAmagResponse>(`${this.baseUrl}${fichaEndpoints.AMAG}`, { params })
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          const rubro = toRubroAmagDesdeDetalle(respuesta.data);
          this.actualizarRubroAmagEnMemoria(id, rubro);
          return rubro;
        }),
        mapearAErrorNegocioApi('No se pudo obtener el rubro de estudios AMAG.')
      );
  }

  upsertEstudioAmag(fichaId: string, item: EstudioAmag): Observable<FichaValoracion> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const ficha = this.asegurarFichaEnMemoria(fichaId);
    const itemId = item.id?.trim() ?? '';
    const esActualizacion = esIdPersistidoApi(itemId);

    let body;
    try {
      body = toGuardarEstudioAmagRequestDto(fichaId, item, !esActualizacion);
    } catch (error) {
      return throwError(() => error);
    }

    const url = esActualizacion
      ? `${this.baseUrl}${fichaEndpoints.estudioAmagPorId(itemId)}`
      : `${this.baseUrl}${fichaEndpoints.AMAG}`;

    const request$ = esActualizacion
      ? this.http.put<GuardarEstudioAmagResponse>(url, body)
      : this.http.post<GuardarEstudioAmagResponse>(url, body);

    return request$.pipe(
      map((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (!respuesta.data) {
          throw new ErrorNegocioApi({
            mensaje: esActualizacion
              ? 'El servidor no devolvió el estudio AMAG actualizado.'
              : 'El servidor no devolvió el estudio AMAG guardado.',
          });
        }
        return this.guardarEnMemoria(aplicarEstudioAmagEnFicha(ficha, item, respuesta.data));
      }),
      mapearAErrorNegocioApi(
        esActualizacion
          ? 'No se pudo actualizar el estudio AMAG.'
          : 'No se pudo guardar el estudio AMAG.'
      )
    );
  }

  eliminarEstudioAmag(fichaId: string, itemId: string): Observable<FichaValoracion> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    const idItem = itemId?.trim() ?? '';
    if (!esIdPersistidoApi(idItem)) {
      return throwError(
        () =>
          new ErrorNegocioApi({
            mensaje: 'Identificador de estudio AMAG no válido.',
          })
      );
    }

    const ficha = this.asegurarFichaEnMemoria(fichaId);
    const url = `${this.baseUrl}${fichaEndpoints.estudioAmagPorId(idItem)}`;

    return this.http.delete<EliminarEstudioAmagResponse>(url).pipe(
      map((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (respuesta.data) {
          const rubro = toRubroAmagDesdeDetalle(respuesta.data);
          return this.guardarEnMemoria({
            ...ficha,
            rubroAmag: rubro,
            actualizadoEn: new Date().toISOString(),
          });
        }
        return this.guardarEnMemoria(eliminarEstudioAmagEnFicha(ficha, idItem));
      }),
      mapearAErrorNegocioApi('No se pudo eliminar el estudio AMAG.')
    );
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
      rubroGradosTitulos: crearRubroGradosTitulosVacio(),
      rubroAmag: crearRubroAmagVacio(),
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

  /**
   * El GET de ficha no trae el detalle del rubro B; si en la sesión ya se guardó
   * titularidad/ítems, se conserva ese estado local sobre la cabecera fresca del API.
   */
  private fusionarConMemoria(fichaApi: FichaValoracion): FichaValoracion {
    const previa = this.fichasEnMemoria.get(fichaApi.id);
    const rubroPrevio = previa?.rubroAntiguedad;
    const rubroGradosPrevio = previa?.rubroGradosTitulos;
    const rubroAmagPrevio = previa?.rubroAmag;
    if (
      rubroPrevio?.id ||
      (rubroGradosPrevio?.items.length ?? 0) > 0 ||
      (rubroAmagPrevio?.items.length ?? 0) > 0
    ) {
      return this.guardarEnMemoria({
        ...fichaApi,
        rubroAntiguedad: rubroPrevio?.id ? rubroPrevio : fichaApi.rubroAntiguedad,
        rubroGradosTitulos: rubroGradosPrevio ?? fichaApi.rubroGradosTitulos,
        rubroAmag: rubroAmagPrevio ?? fichaApi.rubroAmag,
      });
    }

    return this.guardarEnMemoria(fichaApi);
  }

  private actualizarRubroEnMemoria(fichaId: string, rubro: RubroAntiguedad): void {
    const id = fichaId.trim();
    const existente = this.fichasEnMemoria.get(id);
    if (existente) {
      this.guardarEnMemoria({
        ...existente,
        rubroAntiguedad: rubro,
        puntajeTotal: rubro.titularidad.puntaje,
        actualizadoEn: new Date().toISOString(),
      });
      return;
    }

    this.asegurarFichaEnMemoria(id);
    const stub = this.fichasEnMemoria.get(id)!;
    this.guardarEnMemoria({
      ...stub,
      rubroAntiguedad: rubro,
      puntajeTotal: rubro.titularidad.puntaje,
      actualizadoEn: new Date().toISOString(),
    });
  }

  private actualizarRubroGradosEnMemoria(fichaId: string, rubro: RubroGradosTitulos): void {
    const id = fichaId.trim();
    const existente = this.fichasEnMemoria.get(id);
    if (existente) {
      this.guardarEnMemoria({
        ...existente,
        rubroGradosTitulos: rubro,
        actualizadoEn: new Date().toISOString(),
      });
      return;
    }

    this.asegurarFichaEnMemoria(id);
    const stub = this.fichasEnMemoria.get(id)!;
    this.guardarEnMemoria({
      ...stub,
      rubroGradosTitulos: rubro,
      actualizadoEn: new Date().toISOString(),
    });
  }

  private actualizarRubroAmagEnMemoria(fichaId: string, rubro: RubroAmag): void {
    const id = fichaId.trim();
    const existente = this.fichasEnMemoria.get(id);
    if (existente) {
      this.guardarEnMemoria({
        ...existente,
        rubroAmag: rubro,
        actualizadoEn: new Date().toISOString(),
      });
      return;
    }

    this.asegurarFichaEnMemoria(id);
    const stub = this.fichasEnMemoria.get(id)!;
    this.guardarEnMemoria({
      ...stub,
      rubroAmag: rubro,
      actualizadoEn: new Date().toISOString(),
    });
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

  private obtenerIdRubroGradosTitulos(): number {
    const rubro = this.rubrosMaestro.rubros().find((item) => item.codigo === 'C');
    if (!rubro) {
      throw new ErrorNegocioApi({
        mensaje: 'No se encontró el rubro C en el catálogo maestro.',
      });
    }
    return rubro.idRubro;
  }

  private asegurarTokenOpciones(): void {
    if (this.sesion.getTokenNivel() !== tokenNiveles.NIVEL_OPCIONES) {
      throw new Error(
        'Se requiere una sesión con perfil cargado para gestionar fichas.'
      );
    }
  }
}
