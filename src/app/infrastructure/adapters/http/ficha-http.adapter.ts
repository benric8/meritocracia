import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';
import { tokenNiveles } from '../../../domain/commons/constants';
import { ErrorNegocioApi } from '../../../domain/errors/error-negocio-api';
import {
  ActualizarDatosPersonalesFicha,
  CrearBorradorFicha,
  crearRubroAntiguedadVacio,
  crearRubroAmagVacio,
  crearRubroGradosTitulosVacio,
  crearRubroIdiomaVacio,
  crearRubroPublicacionJuridicaVacio,
  crearRubroDistincionVacio,
  crearRubroDocenciaVacio,
  crearRubroDemeritoVacio,
  crearRubroEstudiosPosgradoVacio,
  crearRubroPasantiasVacio,
  crearRubroCursosEspecializacionVacio,
  crearRubroCertamenesAcademicosVacio,
  crearRubroAsistenciasEventosVacio,
  crearRubroOfimaticaVacio,
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
import { EstudioIdioma, RubroIdioma } from '../../../domain/models/rubro-idioma.model';
import {
  PublicacionJuridica,
  RubroPublicacionJuridica,
} from '../../../domain/models/rubro-publicacion-juridica.model';
import {
  Distincion,
  RubroDistincion,
} from '../../../domain/models/rubro-distincion.model';
import {
  DocenciaUniversitaria,
  RubroDocencia,
  TOPE_PUNTAJE_RUBRO_DOCENCIA,
} from '../../../domain/models/rubro-docencia.model';
import { Demerito, RubroDemerito } from '../../../domain/models/rubro-demerito.model';
import {
  EstudioPosgrado,
  RubroEstudiosPosgrado,
  TOPE_PUNTAJE_ESTUDIOS_POSGRADO,
} from '../../../domain/models/rubro-estudios-posgrado.model';
import {
  Pasantia,
  puntajeSubrubroPasantias,
  RubroPasantias,
} from '../../../domain/models/rubro-pasantias.model';
import {
  CursoEspecializacion,
  puntajeSubrubroCursosEspecializacion,
  RubroCursosEspecializacion,
} from '../../../domain/models/rubro-cursos-especializacion.model';
import {
  CertamenAcademico,
  puntajeSubrubroCertamenesAcademicos,
  RubroCertamenesAcademicos,
} from '../../../domain/models/rubro-certamenes-academicos.model';
import {
  AsistenciaEventoAcademico,
  puntajeSubrubroAsistenciasEventos,
  RubroAsistenciasEventos,
} from '../../../domain/models/rubro-asistencias-eventos.model';
import {
  EstudioOfimatica,
  puntajeSubrubroOfimatica,
  RubroOfimatica,
} from '../../../domain/models/rubro-ofimatica.model';
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
  EliminarEstudioIdiomaResponse,
  GuardarEstudioIdiomaResponse,
  ObtenerEstudiosIdiomaResponse,
} from '../../dto/remote/FichaIdiomaResponse.dto';
import {
  EliminarPublicacionJuridicaResponse,
  GuardarPublicacionJuridicaResponse,
  ObtenerPublicacionesJuridicasResponse,
} from '../../dto/remote/FichaPublicacionJuridicaResponse.dto';
import {
  EliminarDistincionResponse,
  GuardarDistincionResponse,
  ObtenerDistincionesResponse,
} from '../../dto/remote/FichaDistincionResponse.dto';
import {
  EliminarDocenciaResponse,
  GuardarDocenciaResponse,
  ObtenerDocenciasResponse,
} from '../../dto/remote/FichaDocenciaResponse.dto';
import {
  EliminarDemeritoResponse,
  GuardarDemeritoResponse,
  ObtenerDemeritosResponse,
} from '../../dto/remote/FichaDemeritoResponse.dto';
import {
  EliminarEstudioPosgradoResponse,
  GuardarEstudioPosgradoResponse,
  ObtenerEstudiosPosgradoResponse,
} from '../../dto/remote/FichaEstudiosPosgradoResponse.dto';
import {
  EliminarPasantiaResponse,
  GuardarPasantiaResponse,
  ObtenerPasantiasResponse,
} from '../../dto/remote/FichaPasantiasResponse.dto';
import {
  EliminarCursoEspecializacionResponse,
  GuardarCursoEspecializacionResponse,
  ObtenerCursosEspecializacionResponse,
} from '../../dto/remote/FichaCursosEspecializacionResponse.dto';
import {
  EliminarCertamenAcademicoResponse,
  GuardarCertamenAcademicoResponse,
  ObtenerCertamenesAcademicosResponse,
} from '../../dto/remote/FichaCertamenesAcademicosResponse.dto';
import {
  EliminarAsistenciaEventoResponse,
  GuardarAsistenciaEventoResponse,
  ObtenerAsistenciasEventosResponse,
} from '../../dto/remote/FichaAsistenciasEventosResponse.dto';
import {
  EliminarOfimaticaResponse,
  GuardarOfimaticaResponse,
  ObtenerOfimaticaResponse,
} from '../../dto/remote/FichaOfimaticaResponse.dto';
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
  aplicarEstudioIdiomaEnFicha,
  eliminarEstudioIdiomaEnFicha,
  toGuardarEstudioIdiomaRequestDto,
  toRubroIdiomaDesdeDetalle,
} from '../../mappers/ficha-idioma.mapper';
import {
  aplicarPublicacionJuridicaEnFicha,
  eliminarPublicacionJuridicaEnFicha,
  toGuardarPublicacionJuridicaRequestDto,
  toRubroPublicacionJuridicaDesdeDetalle,
} from '../../mappers/ficha-publicacion-juridica.mapper';
import {
  aplicarDistincionEnFicha,
  eliminarDistincionEnFicha,
  toGuardarDistincionRequestDto,
  toRubroDistincionDesdeDetalle,
} from '../../mappers/ficha-distincion.mapper';
import {
  aplicarDocenciaEnFicha,
  eliminarDocenciaEnFicha,
  reemplazarDocenciasEnFicha,
  toGuardarDocenciaRequestDto,
  toRubroDocenciaDesdeDetalle,
} from '../../mappers/ficha-docencia.mapper';
import {
  aplicarDemeritoEnFicha,
  eliminarDemeritoEnFicha,
  reemplazarDemeritosEnFicha,
  toGuardarDemeritoRequestDto,
  toRubroDemeritoDesdeDetalle,
} from '../../mappers/ficha-demerito.mapper';
import {
  aplicarEstudioPosgradoEnFicha,
  eliminarEstudioPosgradoEnFicha,
  toGuardarEstudioPosgradoRequestDto,
  toRubroEstudiosPosgradoDesdeDetalle,
} from '../../mappers/ficha-estudios-posgrado.mapper';
import {
  aplicarPasantiaEnFicha,
  eliminarPasantiaEnFicha,
  toGuardarPasantiaRequestDto,
  toRubroPasantiasDesdeDetalle,
} from '../../mappers/ficha-pasantias.mapper';
import {
  aplicarCursoEspecializacionEnFicha,
  eliminarCursoEspecializacionEnFicha,
  toGuardarCursoEspecializacionRequestDto,
  toRubroCursosEspecializacionDesdeDetalle,
} from '../../mappers/ficha-cursos-especializacion.mapper';
import {
  aplicarCertamenAcademicoEnFicha,
  eliminarCertamenAcademicoEnFicha,
  toGuardarCertamenAcademicoRequestDto,
  toRubroCertamenesAcademicosDesdeDetalle,
} from '../../mappers/ficha-certamenes-academicos.mapper';
import {
  aplicarAsistenciaEventoEnFicha,
  eliminarAsistenciaEventoEnFicha,
  toGuardarAsistenciaEventoRequestDto,
  toRubroAsistenciasEventosDesdeDetalle,
} from '../../mappers/ficha-asistencias-eventos.mapper';
import {
  conservarTextosOfimatica,
  toGuardarOfimaticaRequestDto,
  toRubroOfimaticaDesdeDetalle,
} from '../../mappers/ficha-ofimatica.mapper';
import {
  puntajeSubtotalPorCodigo,
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
          const fusionada = this.fusionarConMemoria(ficha);
          return this.aplicarSubtotalOfimatica(
            this.aplicarSubtotalAsistenciasEventos(
            this.aplicarSubtotalCertamenesAcademicos(
            this.aplicarSubtotalCursosEspecializacion(
              this.aplicarSubtotalPasantias(
                this.aplicarSubtotalEstudiosPosgrado(
                  this.aplicarSubtotalDemerito(
                    this.aplicarSubtotalDocencia(fusionada, respuesta.data.rubros),
                    respuesta.data.rubros
                  ),
                  respuesta.data.rubros
                ),
                respuesta.data.rubros
              ),
              respuesta.data.rubros
            ),
            respuesta.data.rubros
            ),
            respuesta.data.rubros
            ),
            respuesta.data.rubros
          );
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
    let rubroId: number;
    try {
      rubroId = this.obtenerIdRubroAmag();
      body = toGuardarEstudioAmagRequestDto(fichaId, item, rubroId, !esActualizacion);
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
    let rubroId: number;
    try {
      rubroId = this.obtenerIdRubroAmag();
    } catch (error) {
      return throwError(() => error);
    }

    const params = new HttpParams().set('rubro_id', String(rubroId));
    const url = `${this.baseUrl}${fichaEndpoints.estudioAmagPorId(idItem)}`;

    return this.http.delete<EliminarEstudioAmagResponse>(url, { params }).pipe(
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

  obtenerRubroIdioma(fichaId: string): Observable<RubroIdioma> {
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
      .get<ObtenerEstudiosIdiomaResponse>(
        `${this.baseUrl}${fichaEndpoints.ESTUDIOS_IDIOMA}`,
        { params }
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          const rubro = toRubroIdiomaDesdeDetalle(respuesta.data);
          this.actualizarRubroIdiomaEnMemoria(id, rubro);
          return rubro;
        }),
        mapearAErrorNegocioApi('No se pudo obtener el rubro de estudios de idioma.')
      );
  }

  upsertEstudioIdioma(fichaId: string, item: EstudioIdioma): Observable<FichaValoracion> {
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
      rubroId = this.obtenerIdRubroIdioma();
      body = toGuardarEstudioIdiomaRequestDto(fichaId, item, rubroId, !esActualizacion);
    } catch (error) {
      return throwError(() => error);
    }

    const url = esActualizacion
      ? `${this.baseUrl}${fichaEndpoints.estudioIdiomaPorId(itemId)}`
      : `${this.baseUrl}${fichaEndpoints.ESTUDIOS_IDIOMA}`;

    const request$ = esActualizacion
      ? this.http.put<GuardarEstudioIdiomaResponse>(url, body)
      : this.http.post<GuardarEstudioIdiomaResponse>(url, body);

    return request$.pipe(
      map((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (!respuesta.data) {
          throw new ErrorNegocioApi({
            mensaje: esActualizacion
              ? 'El servidor no devolvió el estudio de idioma actualizado.'
              : 'El servidor no devolvió el estudio de idioma guardado.',
          });
        }
        return this.guardarEnMemoria(aplicarEstudioIdiomaEnFicha(ficha, item, respuesta.data));
      }),
      mapearAErrorNegocioApi(
        esActualizacion
          ? 'No se pudo actualizar el estudio de idioma.'
          : 'No se pudo guardar el estudio de idioma.'
      )
    );
  }

  eliminarEstudioIdioma(fichaId: string, itemId: string): Observable<FichaValoracion> {
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
            mensaje: 'Identificador de estudio de idioma no válido.',
          })
      );
    }

    const ficha = this.asegurarFichaEnMemoria(fichaId);
    let rubroId: number;
    try {
      rubroId = this.obtenerIdRubroIdioma();
    } catch (error) {
      return throwError(() => error);
    }

    const params = new HttpParams().set('rubro_id', String(rubroId));
    const url = `${this.baseUrl}${fichaEndpoints.estudioIdiomaPorId(idItem)}`;

    return this.http.delete<EliminarEstudioIdiomaResponse>(url, { params }).pipe(
      map((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (respuesta.data?.length) {
          const rubro = toRubroIdiomaDesdeDetalle(respuesta.data);
          return this.guardarEnMemoria({
            ...ficha,
            rubroIdioma: rubro,
            actualizadoEn: new Date().toISOString(),
          });
        }
        return this.guardarEnMemoria(eliminarEstudioIdiomaEnFicha(ficha, idItem));
      }),
      mapearAErrorNegocioApi('No se pudo eliminar el estudio de idioma.')
    );
  }

  obtenerRubroPublicacionJuridica(fichaId: string): Observable<RubroPublicacionJuridica> {
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
      .get<ObtenerPublicacionesJuridicasResponse>(
        `${this.baseUrl}${fichaEndpoints.PUBLICACIONES_JURIDICAS}`,
        { params }
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          const rubro = toRubroPublicacionJuridicaDesdeDetalle(respuesta.data);
          this.actualizarRubroPublicacionJuridicaEnMemoria(id, rubro);
          return rubro;
        }),
        mapearAErrorNegocioApi('No se pudo obtener el rubro de publicaciones jurídicas.')
      );
  }

  upsertPublicacionJuridica(
    fichaId: string,
    item: PublicacionJuridica
  ): Observable<FichaValoracion> {
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
      rubroId = this.obtenerIdRubroPublicacionJuridica();
      body = toGuardarPublicacionJuridicaRequestDto(fichaId, item, rubroId, !esActualizacion);
    } catch (error) {
      return throwError(() => error);
    }

    const url = esActualizacion
      ? `${this.baseUrl}${fichaEndpoints.publicacionJuridicaPorId(itemId)}`
      : `${this.baseUrl}${fichaEndpoints.PUBLICACIONES_JURIDICAS}`;

    const request$ = esActualizacion
      ? this.http.put<GuardarPublicacionJuridicaResponse>(url, body)
      : this.http.post<GuardarPublicacionJuridicaResponse>(url, body);

    return request$.pipe(
      map((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (!respuesta.data) {
          throw new ErrorNegocioApi({
            mensaje: esActualizacion
              ? 'El servidor no devolvió la publicación actualizada.'
              : 'El servidor no devolvió la publicación guardada.',
          });
        }
        return this.guardarEnMemoria(
          aplicarPublicacionJuridicaEnFicha(ficha, item, respuesta.data)
        );
      }),
      mapearAErrorNegocioApi(
        esActualizacion
          ? 'No se pudo actualizar la publicación jurídica.'
          : 'No se pudo guardar la publicación jurídica.'
      )
    );
  }

  eliminarPublicacionJuridica(fichaId: string, itemId: string): Observable<FichaValoracion> {
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
            mensaje: 'Identificador de publicación no válido.',
          })
      );
    }

    const ficha = this.asegurarFichaEnMemoria(fichaId);
    let rubroId: number;
    try {
      rubroId = this.obtenerIdRubroPublicacionJuridica();
    } catch (error) {
      return throwError(() => error);
    }

    const params = new HttpParams().set('rubro_id', String(rubroId));
    const url = `${this.baseUrl}${fichaEndpoints.publicacionJuridicaPorId(idItem)}`;

    return this.http.delete<EliminarPublicacionJuridicaResponse>(url, { params }).pipe(
      map((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (respuesta.data?.length) {
          const rubro = toRubroPublicacionJuridicaDesdeDetalle(respuesta.data);
          return this.guardarEnMemoria({
            ...ficha,
            rubroPublicacionJuridica: rubro,
            actualizadoEn: new Date().toISOString(),
          });
        }
        return this.guardarEnMemoria(eliminarPublicacionJuridicaEnFicha(ficha, idItem));
      }),
      mapearAErrorNegocioApi('No se pudo eliminar la publicación jurídica.')
    );
  }

  obtenerRubroDistincion(fichaId: string): Observable<RubroDistincion> {
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
      .get<ObtenerDistincionesResponse>(`${this.baseUrl}${fichaEndpoints.DISTINCIONES}`, {
        params,
      })
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          const rubro = toRubroDistincionDesdeDetalle(respuesta.data);
          this.actualizarRubroDistincionEnMemoria(id, rubro);
          return rubro;
        }),
        mapearAErrorNegocioApi('No se pudo obtener el rubro de distinciones.')
      );
  }

  upsertDistincion(fichaId: string, item: Distincion): Observable<FichaValoracion> {
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
      rubroId = this.obtenerIdRubroDistincion();
      body = toGuardarDistincionRequestDto(fichaId, item, rubroId, !esActualizacion);
    } catch (error) {
      return throwError(() => error);
    }

    const url = esActualizacion
      ? `${this.baseUrl}${fichaEndpoints.distincionPorId(itemId)}`
      : `${this.baseUrl}${fichaEndpoints.DISTINCIONES}`;

    const request$ = esActualizacion
      ? this.http.put<GuardarDistincionResponse>(url, body)
      : this.http.post<GuardarDistincionResponse>(url, body);

    return request$.pipe(
      map((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (!respuesta.data) {
          throw new ErrorNegocioApi({
            mensaje: esActualizacion
              ? 'El servidor no devolvió la distinción actualizada.'
              : 'El servidor no devolvió la distinción guardada.',
          });
        }
        return this.guardarEnMemoria(aplicarDistincionEnFicha(ficha, item, respuesta.data));
      }),
      mapearAErrorNegocioApi(
        esActualizacion
          ? 'No se pudo actualizar la distinción.'
          : 'No se pudo guardar la distinción.'
      )
    );
  }

  eliminarDistincion(fichaId: string, itemId: string): Observable<FichaValoracion> {
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
            mensaje: 'Identificador de distinción no válido.',
          })
      );
    }

    const ficha = this.asegurarFichaEnMemoria(fichaId);
    let rubroId: number;
    try {
      rubroId = this.obtenerIdRubroDistincion();
    } catch (error) {
      return throwError(() => error);
    }

    const params = new HttpParams().set('rubro_id', String(rubroId));
    const url = `${this.baseUrl}${fichaEndpoints.distincionPorId(idItem)}`;

    return this.http.delete<EliminarDistincionResponse>(url, { params }).pipe(
      map((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (respuesta.data?.length) {
          const rubro = toRubroDistincionDesdeDetalle(respuesta.data);
          return this.guardarEnMemoria({
            ...ficha,
            rubroDistincion: rubro,
            actualizadoEn: new Date().toISOString(),
          });
        }
        return this.guardarEnMemoria(eliminarDistincionEnFicha(ficha, idItem));
      }),
      mapearAErrorNegocioApi('No se pudo eliminar la distinción.')
    );
  }

  obtenerRubroDocencia(fichaId: string): Observable<RubroDocencia> {
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
      .get<ObtenerDocenciasResponse>(`${this.baseUrl}${fichaEndpoints.DOCENCIA}`, { params })
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          const lineas = toRubroDocenciaDesdeDetalle(respuesta.data);
          const puntajePrevio = this.fichasEnMemoria.get(id)?.rubroDocencia?.puntajeTotal ?? 0;
          const rubro: RubroDocencia = {
            items: lineas.items,
            puntajeTotal: puntajePrevio,
          };
          this.actualizarRubroDocenciaEnMemoria(id, rubro);
          return rubro;
        }),
        mapearAErrorNegocioApi('No se pudo obtener el rubro de docencia.')
      );
  }

  upsertDocencia(fichaId: string, item: DocenciaUniversitaria): Observable<FichaValoracion> {
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
      body = toGuardarDocenciaRequestDto(
        fichaId,
        item,
        this.obtenerIdRubroDocencia(),
        !esActualizacion
      );
    } catch (error) {
      return throwError(() => error);
    }

    const url = esActualizacion
      ? `${this.baseUrl}${fichaEndpoints.docenciaPorId(itemId)}`
      : `${this.baseUrl}${fichaEndpoints.DOCENCIA}`;

    const request$ = esActualizacion
      ? this.http.put<GuardarDocenciaResponse>(url, body)
      : this.http.post<GuardarDocenciaResponse>(url, body);

    return request$.pipe(
      switchMap((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (!respuesta.data) {
          throw new ErrorNegocioApi({
            mensaje: esActualizacion
              ? 'El servidor no devolvió la docencia actualizada.'
              : 'El servidor no devolvió la docencia guardada.',
          });
        }
        this.guardarEnMemoria(aplicarDocenciaEnFicha(ficha, item, respuesta.data));
        return this.refrescarFichaTrasDocencia(fichaId);
      }),
      mapearAErrorNegocioApi(
        esActualizacion
          ? 'No se pudo actualizar la docencia.'
          : 'No se pudo guardar la docencia.'
      )
    );
  }

  eliminarDocencia(fichaId: string, itemId: string): Observable<FichaValoracion> {
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
            mensaje: 'Identificador de docencia no válido.',
          })
      );
    }

    const ficha = this.asegurarFichaEnMemoria(fichaId);
    let rubroId: number;
    try {
      rubroId = this.obtenerIdRubroDocencia();
    } catch (error) {
      return throwError(() => error);
    }

    const params = new HttpParams().set('rubro_id', String(rubroId));
    const url = `${this.baseUrl}${fichaEndpoints.docenciaPorId(idItem)}`;

    return this.http.delete<EliminarDocenciaResponse>(url, { params }).pipe(
      switchMap((respuesta) => {
        assertRespuestaExitosa(respuesta);
        const actualizada = respuesta.data?.length
          ? reemplazarDocenciasEnFicha(ficha, respuesta.data)
          : eliminarDocenciaEnFicha(ficha, idItem);
        this.guardarEnMemoria(actualizada);
        return this.refrescarFichaTrasDocencia(fichaId);
      }),
      mapearAErrorNegocioApi('No se pudo eliminar la docencia.')
    );
  }

  obtenerRubroDemerito(fichaId: string): Observable<RubroDemerito> {
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
      .get<ObtenerDemeritosResponse>(`${this.baseUrl}${fichaEndpoints.DEMERITOS}`, { params })
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          const lineas = toRubroDemeritoDesdeDetalle(respuesta.data);
          const puntajePrevio = this.fichasEnMemoria.get(id)?.rubroDemerito?.puntajeTotal ?? 0;
          const rubro: RubroDemerito = {
            items: lineas.items,
            puntajeTotal: puntajePrevio,
          };
          this.actualizarRubroDemeritoEnMemoria(id, rubro);
          return rubro;
        }),
        mapearAErrorNegocioApi('No se pudo obtener el rubro de deméritos.')
      );
  }

  upsertDemerito(fichaId: string, item: Demerito): Observable<FichaValoracion> {
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
      body = toGuardarDemeritoRequestDto(
        fichaId,
        item,
        this.obtenerIdRubroDemerito(),
        !esActualizacion
      );
    } catch (error) {
      return throwError(() => error);
    }

    const url = esActualizacion
      ? `${this.baseUrl}${fichaEndpoints.demeritoPorId(itemId)}`
      : `${this.baseUrl}${fichaEndpoints.DEMERITOS}`;

    const request$ = esActualizacion
      ? this.http.put<GuardarDemeritoResponse>(url, body)
      : this.http.post<GuardarDemeritoResponse>(url, body);

    return request$.pipe(
      switchMap((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (!respuesta.data) {
          throw new ErrorNegocioApi({
            mensaje: esActualizacion
              ? 'El servidor no devolvió el demérito actualizado.'
              : 'El servidor no devolvió el demérito guardado.',
          });
        }
        this.guardarEnMemoria(aplicarDemeritoEnFicha(ficha, item, respuesta.data));
        return this.refrescarFichaTrasDemerito(fichaId);
      }),
      mapearAErrorNegocioApi(
        esActualizacion ? 'No se pudo actualizar el demérito.' : 'No se pudo guardar el demérito.'
      )
    );
  }

  eliminarDemerito(fichaId: string, itemId: string): Observable<FichaValoracion> {
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
            mensaje: 'Identificador de demérito no válido.',
          })
      );
    }

    const ficha = this.asegurarFichaEnMemoria(fichaId);
    let rubroId: number;
    try {
      rubroId = this.obtenerIdRubroDemerito();
    } catch (error) {
      return throwError(() => error);
    }

    const params = new HttpParams().set('rubro_id', String(rubroId));
    const url = `${this.baseUrl}${fichaEndpoints.demeritoPorId(idItem)}`;

    return this.http.delete<EliminarDemeritoResponse>(url, { params }).pipe(
      switchMap((respuesta) => {
        assertRespuestaExitosa(respuesta);
        const actualizada = respuesta.data?.length
          ? reemplazarDemeritosEnFicha(ficha, respuesta.data)
          : eliminarDemeritoEnFicha(ficha, idItem);
        this.guardarEnMemoria(actualizada);
        return this.refrescarFichaTrasDemerito(fichaId);
      }),
      mapearAErrorNegocioApi('No se pudo eliminar el demérito.')
    );
  }

  obtenerRubroEstudiosPosgrado(fichaId: string): Observable<RubroEstudiosPosgrado> {
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
      .get<ObtenerEstudiosPosgradoResponse>(
        `${this.baseUrl}${fichaEndpoints.ESTUDIOS_POSGRADO}`,
        { params }
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          const lineas = toRubroEstudiosPosgradoDesdeDetalle(respuesta.data);
          const previo = this.fichasEnMemoria.get(id)?.rubroEstudiosPosgrado;
          const rubro: RubroEstudiosPosgrado = {
            items: lineas.items.map((item) => {
              const anterior = previo?.items.find((actual) => actual.id === item.id);
              return {
                ...item,
                institucionNombre: item.institucionNombre || anterior?.institucionNombre || '',
                paisNombre: item.paisNombre || anterior?.paisNombre || '',
              };
            }),
            puntajeTotal: previo?.puntajeTotal ?? 0,
          };
          this.actualizarRubroEstudiosPosgradoEnMemoria(id, rubro);
          return rubro;
        }),
        mapearAErrorNegocioApi('No se pudo obtener el subrubro E1.')
      );
  }

  upsertEstudioPosgrado(fichaId: string, item: EstudioPosgrado): Observable<FichaValoracion> {
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
      body = toGuardarEstudioPosgradoRequestDto(
        fichaId,
        item,
        this.obtenerIdRubroEstudiosPosgrado(),
        !esActualizacion
      );
    } catch (error) {
      return throwError(() => error);
    }

    const url = esActualizacion
      ? `${this.baseUrl}${fichaEndpoints.estudioPosgradoPorId(itemId)}`
      : `${this.baseUrl}${fichaEndpoints.ESTUDIOS_POSGRADO}`;

    const request$ = esActualizacion
      ? this.http.put<GuardarEstudioPosgradoResponse>(url, body)
      : this.http.post<GuardarEstudioPosgradoResponse>(url, body);

    return request$.pipe(
      switchMap((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (!respuesta.data) {
          throw new ErrorNegocioApi({
            mensaje: esActualizacion
              ? 'El servidor no devolvió el semestre actualizado.'
              : 'El servidor no devolvió el semestre guardado.',
          });
        }
        this.guardarEnMemoria(aplicarEstudioPosgradoEnFicha(ficha, item, respuesta.data));
        return this.refrescarFichaTrasEstudiosPosgrado(fichaId);
      }),
      mapearAErrorNegocioApi(
        esActualizacion
          ? 'No se pudo actualizar el semestre de posgrado.'
          : 'No se pudo guardar el semestre de posgrado.'
      )
    );
  }

  eliminarEstudioPosgrado(fichaId: string, itemId: string): Observable<FichaValoracion> {
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
            mensaje: 'Identificador de estudio de posgrado no válido.',
          })
      );
    }

    const ficha = this.asegurarFichaEnMemoria(fichaId);
    let rubroId: number;
    try {
      rubroId = this.obtenerIdRubroEstudiosPosgrado();
    } catch (error) {
      return throwError(() => error);
    }

    const params = new HttpParams().set('rubro_id', String(rubroId));
    const url = `${this.baseUrl}${fichaEndpoints.estudioPosgradoPorId(idItem)}`;

    return this.http.delete<EliminarEstudioPosgradoResponse>(url, { params }).pipe(
      switchMap((respuesta) => {
        assertRespuestaExitosa(respuesta);
        this.guardarEnMemoria(eliminarEstudioPosgradoEnFicha(ficha, idItem));
        return this.refrescarFichaTrasEstudiosPosgrado(fichaId);
      }),
      mapearAErrorNegocioApi('No se pudo eliminar el semestre de posgrado.')
    );
  }

  obtenerRubroPasantias(fichaId: string): Observable<RubroPasantias> {
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
      .get<ObtenerPasantiasResponse>(`${this.baseUrl}${fichaEndpoints.PASANTIAS}`, { params })
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          const previo = this.fichasEnMemoria.get(id)?.rubroPasantias;
          const rubro = toRubroPasantiasDesdeDetalle(respuesta.data, previo?.puntajeTotal);
          this.actualizarRubroPasantiasEnMemoria(id, rubro);
          return rubro;
        }),
        mapearAErrorNegocioApi('No se pudo obtener el subrubro E2.')
      );
  }

  upsertPasantia(fichaId: string, item: Pasantia): Observable<FichaValoracion> {
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
      body = toGuardarPasantiaRequestDto(
        fichaId,
        item,
        this.obtenerIdRubroEstudiosPosgrado(),
        !esActualizacion
      );
    } catch (error) {
      return throwError(() => error);
    }

    const url = esActualizacion
      ? `${this.baseUrl}${fichaEndpoints.pasantiaPorId(itemId)}`
      : `${this.baseUrl}${fichaEndpoints.PASANTIAS}`;

    const request$ = esActualizacion
      ? this.http.put<GuardarPasantiaResponse>(url, body)
      : this.http.post<GuardarPasantiaResponse>(url, body);

    return request$.pipe(
      switchMap((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (!respuesta.data) {
          throw new ErrorNegocioApi({
            mensaje: esActualizacion
              ? 'El servidor no devolvió la pasantía actualizada.'
              : 'El servidor no devolvió la pasantía guardada.',
          });
        }
        this.guardarEnMemoria(aplicarPasantiaEnFicha(ficha, item, respuesta.data));
        return this.refrescarFichaTrasPasantias(fichaId);
      }),
      mapearAErrorNegocioApi(
        esActualizacion ? 'No se pudo actualizar la pasantía.' : 'No se pudo guardar la pasantía.'
      )
    );
  }

  eliminarPasantia(fichaId: string, itemId: string): Observable<FichaValoracion> {
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
            mensaje: 'Identificador de pasantía no válido.',
          })
      );
    }

    const ficha = this.asegurarFichaEnMemoria(fichaId);
    let rubroId: number;
    try {
      rubroId = this.obtenerIdRubroEstudiosPosgrado();
    } catch (error) {
      return throwError(() => error);
    }

    const params = new HttpParams().set('rubro_id', String(rubroId));
    const url = `${this.baseUrl}${fichaEndpoints.pasantiaPorId(idItem)}`;

    return this.http.delete<EliminarPasantiaResponse>(url, { params }).pipe(
      switchMap((respuesta) => {
        assertRespuestaExitosa(respuesta);
        this.guardarEnMemoria(eliminarPasantiaEnFicha(ficha, idItem));
        return this.refrescarFichaTrasPasantias(fichaId);
      }),
      mapearAErrorNegocioApi('No se pudo eliminar la pasantía.')
    );
  }

  obtenerRubroCursosEspecializacion(fichaId: string): Observable<RubroCursosEspecializacion> {
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
      .get<ObtenerCursosEspecializacionResponse>(
        `${this.baseUrl}${fichaEndpoints.CURSOS_ESPECIALIZACION}`,
        { params }
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          const previo = this.fichasEnMemoria.get(id)?.rubroCursosEspecializacion;
          const rubro = toRubroCursosEspecializacionDesdeDetalle(
            respuesta.data,
            previo?.puntajeTotal
          );
          this.actualizarRubroCursosEspecializacionEnMemoria(id, rubro);
          return rubro;
        }),
        mapearAErrorNegocioApi('No se pudo obtener el subrubro E3.')
      );
  }

  upsertCursoEspecializacion(
    fichaId: string,
    item: CursoEspecializacion
  ): Observable<FichaValoracion> {
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
      body = toGuardarCursoEspecializacionRequestDto(
        fichaId,
        item,
        this.obtenerIdRubroEstudiosPosgrado(),
        !esActualizacion
      );
    } catch (error) {
      return throwError(() => error);
    }

    const url = esActualizacion
      ? `${this.baseUrl}${fichaEndpoints.cursoEspecializacionPorId(itemId)}`
      : `${this.baseUrl}${fichaEndpoints.CURSOS_ESPECIALIZACION}`;

    const request$ = esActualizacion
      ? this.http.put<GuardarCursoEspecializacionResponse>(url, body)
      : this.http.post<GuardarCursoEspecializacionResponse>(url, body);

    return request$.pipe(
      switchMap((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (!respuesta.data) {
          throw new ErrorNegocioApi({
            mensaje: esActualizacion
              ? 'El servidor no devolvió el curso actualizado.'
              : 'El servidor no devolvió el curso guardado.',
          });
        }
        this.guardarEnMemoria(aplicarCursoEspecializacionEnFicha(ficha, item, respuesta.data));
        return this.refrescarFichaTrasCursosEspecializacion(fichaId);
      }),
      mapearAErrorNegocioApi(
        esActualizacion
          ? 'No se pudo actualizar el curso de especialización.'
          : 'No se pudo guardar el curso de especialización.'
      )
    );
  }

  eliminarCursoEspecializacion(fichaId: string, itemId: string): Observable<FichaValoracion> {
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
            mensaje: 'Identificador de curso no válido.',
          })
      );
    }

    const ficha = this.asegurarFichaEnMemoria(fichaId);
    let rubroId: number;
    try {
      rubroId = this.obtenerIdRubroEstudiosPosgrado();
    } catch (error) {
      return throwError(() => error);
    }

    const params = new HttpParams().set('rubro_id', String(rubroId));
    const url = `${this.baseUrl}${fichaEndpoints.cursoEspecializacionPorId(idItem)}`;

    return this.http.delete<EliminarCursoEspecializacionResponse>(url, { params }).pipe(
      switchMap((respuesta) => {
        assertRespuestaExitosa(respuesta);
        this.guardarEnMemoria(eliminarCursoEspecializacionEnFicha(ficha, idItem));
        return this.refrescarFichaTrasCursosEspecializacion(fichaId);
      }),
      mapearAErrorNegocioApi('No se pudo eliminar el curso de especialización.')
    );
  }

  obtenerRubroCertamenesAcademicos(fichaId: string): Observable<RubroCertamenesAcademicos> {
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
      .get<ObtenerCertamenesAcademicosResponse>(
        `${this.baseUrl}${fichaEndpoints.CERTAMENES_ACADEMICOS}`,
        { params }
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          const previo = this.fichasEnMemoria.get(id)?.rubroCertamenesAcademicos;
          const rubro = toRubroCertamenesAcademicosDesdeDetalle(
            respuesta.data,
            previo?.puntajeTotal
          );
          this.actualizarRubroCertamenesAcademicosEnMemoria(id, rubro);
          return rubro;
        }),
        mapearAErrorNegocioApi('No se pudo obtener el subrubro E4.')
      );
  }

  upsertCertamenAcademico(fichaId: string, item: CertamenAcademico): Observable<FichaValoracion> {
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
      body = toGuardarCertamenAcademicoRequestDto(
        fichaId,
        item,
        this.obtenerIdRubroEstudiosPosgrado(),
        !esActualizacion
      );
    } catch (error) {
      return throwError(() => error);
    }

    const url = esActualizacion
      ? `${this.baseUrl}${fichaEndpoints.certamenAcademicoPorId(itemId)}`
      : `${this.baseUrl}${fichaEndpoints.CERTAMENES_ACADEMICOS}`;

    const request$ = esActualizacion
      ? this.http.put<GuardarCertamenAcademicoResponse>(url, body)
      : this.http.post<GuardarCertamenAcademicoResponse>(url, body);

    return request$.pipe(
      switchMap((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (!respuesta.data) {
          throw new ErrorNegocioApi({
            mensaje: esActualizacion
              ? 'El servidor no devolvió el certamen actualizado.'
              : 'El servidor no devolvió el certamen guardado.',
          });
        }
        this.guardarEnMemoria(aplicarCertamenAcademicoEnFicha(ficha, item, respuesta.data));
        return this.refrescarFichaTrasCertamenesAcademicos(fichaId);
      }),
      mapearAErrorNegocioApi(
        esActualizacion
          ? 'No se pudo actualizar el certamen académico.'
          : 'No se pudo guardar el certamen académico.'
      )
    );
  }

  eliminarCertamenAcademico(fichaId: string, itemId: string): Observable<FichaValoracion> {
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
            mensaje: 'Identificador de certamen no válido.',
          })
      );
    }

    const ficha = this.asegurarFichaEnMemoria(fichaId);
    let rubroId: number;
    try {
      rubroId = this.obtenerIdRubroEstudiosPosgrado();
    } catch (error) {
      return throwError(() => error);
    }

    const params = new HttpParams().set('rubro_id', String(rubroId));
    const url = `${this.baseUrl}${fichaEndpoints.certamenAcademicoPorId(idItem)}`;

    return this.http.delete<EliminarCertamenAcademicoResponse>(url, { params }).pipe(
      switchMap((respuesta) => {
        assertRespuestaExitosa(respuesta);
        this.guardarEnMemoria(eliminarCertamenAcademicoEnFicha(ficha, idItem));
        return this.refrescarFichaTrasCertamenesAcademicos(fichaId);
      }),
      mapearAErrorNegocioApi('No se pudo eliminar el certamen académico.')
    );
  }

  obtenerRubroAsistenciasEventos(fichaId: string): Observable<RubroAsistenciasEventos> {
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
      .get<ObtenerAsistenciasEventosResponse>(
        `${this.baseUrl}${fichaEndpoints.ASISTENCIAS_EVENTOS}`,
        { params }
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          const previo = this.fichasEnMemoria.get(id)?.rubroAsistenciasEventos;
          const rubro = toRubroAsistenciasEventosDesdeDetalle(
            respuesta.data,
            previo?.puntajeTotal
          );
          this.actualizarRubroAsistenciasEventosEnMemoria(id, rubro);
          return rubro;
        }),
        mapearAErrorNegocioApi('No se pudo obtener el subrubro E5.')
      );
  }

  upsertAsistenciaEvento(
    fichaId: string,
    item: AsistenciaEventoAcademico
  ): Observable<FichaValoracion> {
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
      body = toGuardarAsistenciaEventoRequestDto(
        fichaId,
        item,
        this.obtenerIdRubroEstudiosPosgrado(),
        !esActualizacion
      );
    } catch (error) {
      return throwError(() => error);
    }

    const url = esActualizacion
      ? `${this.baseUrl}${fichaEndpoints.asistenciaEventoPorId(itemId)}`
      : `${this.baseUrl}${fichaEndpoints.ASISTENCIAS_EVENTOS}`;

    const request$ = esActualizacion
      ? this.http.put<GuardarAsistenciaEventoResponse>(url, body)
      : this.http.post<GuardarAsistenciaEventoResponse>(url, body);

    return request$.pipe(
      switchMap((respuesta) => {
        assertRespuestaExitosa(respuesta);
        if (!respuesta.data) {
          throw new ErrorNegocioApi({
            mensaje: esActualizacion
              ? 'El servidor no devolvió la asistencia actualizada.'
              : 'El servidor no devolvió la asistencia guardada.',
          });
        }
        this.guardarEnMemoria(aplicarAsistenciaEventoEnFicha(ficha, item, respuesta.data));
        return this.refrescarFichaTrasAsistenciasEventos(fichaId);
      }),
      mapearAErrorNegocioApi(
        esActualizacion
          ? 'No se pudo actualizar la asistencia al evento.'
          : 'No se pudo guardar la asistencia al evento.'
      )
    );
  }

  eliminarAsistenciaEvento(fichaId: string, itemId: string): Observable<FichaValoracion> {
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
            mensaje: 'Identificador de asistencia no válido.',
          })
      );
    }

    const ficha = this.asegurarFichaEnMemoria(fichaId);
    let rubroId: number;
    try {
      rubroId = this.obtenerIdRubroEstudiosPosgrado();
    } catch (error) {
      return throwError(() => error);
    }

    const params = new HttpParams().set('rubro_id', String(rubroId));
    const url = `${this.baseUrl}${fichaEndpoints.asistenciaEventoPorId(idItem)}`;

    return this.http.delete<EliminarAsistenciaEventoResponse>(url, { params }).pipe(
      switchMap((respuesta) => {
        assertRespuestaExitosa(respuesta);
        this.guardarEnMemoria(eliminarAsistenciaEventoEnFicha(ficha, idItem));
        return this.refrescarFichaTrasAsistenciasEventos(fichaId);
      }),
      mapearAErrorNegocioApi('No se pudo eliminar la asistencia al evento.')
    );
  }

  obtenerRubroOfimatica(fichaId: string): Observable<RubroOfimatica> {
    return this.recargarListaOfimatica(fichaId);
  }

  upsertOfimatica(fichaId: string, item: EstudioOfimatica): Observable<FichaValoracion> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    this.asegurarFichaEnMemoria(fichaId);
    const itemId = item.id?.trim() ?? '';
    const esActualizacion = esIdPersistidoApi(itemId);

    let body;
    try {
      body = toGuardarOfimaticaRequestDto(
        fichaId,
        item,
        this.obtenerIdRubroEstudiosPosgrado(),
        !esActualizacion
      );
    } catch (error) {
      return throwError(() => error);
    }

    const params = new HttpParams().set('formato_respuesta', 'JSON');
    const url = esActualizacion
      ? `${this.baseUrl}${fichaEndpoints.ofimaticaPorId(itemId)}`
      : `${this.baseUrl}${fichaEndpoints.OFIMATICA}`;

    const request$ = esActualizacion
      ? this.http.put<GuardarOfimaticaResponse>(url, body, { params })
      : this.http.post<GuardarOfimaticaResponse>(url, body, { params });

    return request$.pipe(
      switchMap((respuesta) => {
        assertRespuestaExitosa(respuesta);
        return this.recargarListaOfimatica(fichaId, item);
      }),
      switchMap(() => this.refrescarFichaTrasOfimatica(fichaId)),
      mapearAErrorNegocioApi(
        esActualizacion
          ? 'No se pudo actualizar el estudio de ofimática.'
          : 'No se pudo guardar el estudio de ofimática.'
      )
    );
  }

  eliminarOfimatica(fichaId: string, itemId: string): Observable<FichaValoracion> {
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
            mensaje: 'Identificador de estudio de ofimática no válido.',
          })
      );
    }

    this.asegurarFichaEnMemoria(fichaId);
    let rubroId: number;
    try {
      rubroId = this.obtenerIdRubroEstudiosPosgrado();
    } catch (error) {
      return throwError(() => error);
    }

    const params = new HttpParams()
      .set('rubro_id', String(rubroId))
      .set('formato_respuesta', 'JSON');
    const url = `${this.baseUrl}${fichaEndpoints.ofimaticaPorId(idItem)}`;

    return this.http.delete<EliminarOfimaticaResponse>(url, { params }).pipe(
      switchMap((respuesta) => {
        assertRespuestaExitosa(respuesta);
        return this.recargarListaOfimatica(fichaId);
      }),
      switchMap(() => this.refrescarFichaTrasOfimatica(fichaId)),
      mapearAErrorNegocioApi('No se pudo eliminar el estudio de ofimática.')
    );
  }

  private recargarListaOfimatica(
    fichaId: string,
    enviado?: EstudioOfimatica
  ): Observable<RubroOfimatica> {
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
      .set('registrador_id', String(registradorId))
      .set('formato_respuesta', 'JSON');

    return this.http
      .get<ObtenerOfimaticaResponse>(`${this.baseUrl}${fichaEndpoints.OFIMATICA}`, { params })
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          const previo = this.fichasEnMemoria.get(id)?.rubroOfimatica;
          const rubro = conservarTextosOfimatica(
            toRubroOfimaticaDesdeDetalle(respuesta.data, previo?.puntajeTotal),
            previo?.items ?? [],
            enviado
          );
          this.actualizarRubroOfimaticaEnMemoria(id, rubro);
          return rubro;
        }),
        mapearAErrorNegocioApi('No se pudo obtener el subrubro E6.')
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
      rubroIdioma: crearRubroIdiomaVacio(),
      rubroPublicacionJuridica: crearRubroPublicacionJuridicaVacio(),
      rubroDistincion: crearRubroDistincionVacio(),
      rubroDocencia: crearRubroDocenciaVacio(),
      rubroDemerito: crearRubroDemeritoVacio(),
      rubroEstudiosPosgrado: crearRubroEstudiosPosgradoVacio(),
      rubroPasantias: crearRubroPasantiasVacio(),
      rubroCursosEspecializacion: crearRubroCursosEspecializacionVacio(),
      rubroCertamenesAcademicos: crearRubroCertamenesAcademicosVacio(),
      rubroAsistenciasEventos: crearRubroAsistenciasEventosVacio(),
      rubroOfimatica: crearRubroOfimaticaVacio(),
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
    const rubroIdiomaPrevio = previa?.rubroIdioma;
    const rubroPublicacionPrevio = previa?.rubroPublicacionJuridica;
    const rubroDistincionPrevio = previa?.rubroDistincion;
    const rubroDocenciaPrevio = previa?.rubroDocencia;
    const rubroDemeritoPrevio = previa?.rubroDemerito;
    const rubroEstudiosPosgradoPrevio = previa?.rubroEstudiosPosgrado;
    const rubroPasantiasPrevio = previa?.rubroPasantias;
    const rubroCursosPrevio = previa?.rubroCursosEspecializacion;
    const rubroCertamenesPrevio = previa?.rubroCertamenesAcademicos;
    const rubroAsistenciasPrevio = previa?.rubroAsistenciasEventos;
    const rubroOfimaticaPrevio = previa?.rubroOfimatica;
    if (
      rubroPrevio?.id ||
      (rubroGradosPrevio?.items.length ?? 0) > 0 ||
      (rubroAmagPrevio?.items.length ?? 0) > 0 ||
      (rubroIdiomaPrevio?.items.length ?? 0) > 0 ||
      (rubroPublicacionPrevio?.items.length ?? 0) > 0 ||
      (rubroDistincionPrevio?.items.length ?? 0) > 0 ||
      (rubroDocenciaPrevio?.items.length ?? 0) > 0 ||
      (rubroDemeritoPrevio?.items.length ?? 0) > 0 ||
      (rubroEstudiosPosgradoPrevio?.items.length ?? 0) > 0 ||
      (rubroPasantiasPrevio?.items.length ?? 0) > 0 ||
      (rubroCursosPrevio?.items.length ?? 0) > 0 ||
      (rubroCertamenesPrevio?.items.length ?? 0) > 0 ||
      (rubroAsistenciasPrevio?.items.length ?? 0) > 0 ||
      (rubroOfimaticaPrevio?.items.length ?? 0) > 0
    ) {
      return this.guardarEnMemoria({
        ...fichaApi,
        rubroAntiguedad: rubroPrevio?.id ? rubroPrevio : fichaApi.rubroAntiguedad,
        rubroGradosTitulos: rubroGradosPrevio ?? fichaApi.rubroGradosTitulos,
        rubroAmag: rubroAmagPrevio ?? fichaApi.rubroAmag,
        rubroIdioma: rubroIdiomaPrevio ?? fichaApi.rubroIdioma,
        rubroPublicacionJuridica:
          rubroPublicacionPrevio ?? fichaApi.rubroPublicacionJuridica,
        rubroDistincion: rubroDistincionPrevio ?? fichaApi.rubroDistincion,
        rubroDocencia:
          rubroDocenciaPrevio && rubroDocenciaPrevio.items.length > 0
            ? rubroDocenciaPrevio
            : fichaApi.rubroDocencia,
        rubroDemerito:
          rubroDemeritoPrevio && rubroDemeritoPrevio.items.length > 0
            ? rubroDemeritoPrevio
            : fichaApi.rubroDemerito,
        rubroEstudiosPosgrado:
          rubroEstudiosPosgradoPrevio && rubroEstudiosPosgradoPrevio.items.length > 0
            ? rubroEstudiosPosgradoPrevio
            : fichaApi.rubroEstudiosPosgrado,
        rubroPasantias:
          rubroPasantiasPrevio && rubroPasantiasPrevio.items.length > 0
            ? rubroPasantiasPrevio
            : fichaApi.rubroPasantias,
        rubroCursosEspecializacion:
          rubroCursosPrevio && rubroCursosPrevio.items.length > 0
            ? rubroCursosPrevio
            : fichaApi.rubroCursosEspecializacion,
        rubroCertamenesAcademicos:
          rubroCertamenesPrevio && rubroCertamenesPrevio.items.length > 0
            ? rubroCertamenesPrevio
            : fichaApi.rubroCertamenesAcademicos,
        rubroAsistenciasEventos:
          rubroAsistenciasPrevio && rubroAsistenciasPrevio.items.length > 0
            ? rubroAsistenciasPrevio
            : fichaApi.rubroAsistenciasEventos,
        rubroOfimatica:
          rubroOfimaticaPrevio && rubroOfimaticaPrevio.items.length > 0
            ? rubroOfimaticaPrevio
            : fichaApi.rubroOfimatica,
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

  private actualizarRubroIdiomaEnMemoria(fichaId: string, rubro: RubroIdioma): void {
    const id = fichaId.trim();
    const existente = this.fichasEnMemoria.get(id);
    if (existente) {
      this.guardarEnMemoria({
        ...existente,
        rubroIdioma: rubro,
        actualizadoEn: new Date().toISOString(),
      });
      return;
    }

    this.asegurarFichaEnMemoria(id);
    const stub = this.fichasEnMemoria.get(id)!;
    this.guardarEnMemoria({
      ...stub,
      rubroIdioma: rubro,
      actualizadoEn: new Date().toISOString(),
    });
  }

  private actualizarRubroPublicacionJuridicaEnMemoria(
    fichaId: string,
    rubro: RubroPublicacionJuridica
  ): void {
    const id = fichaId.trim();
    const existente = this.fichasEnMemoria.get(id);
    if (existente) {
      this.guardarEnMemoria({
        ...existente,
        rubroPublicacionJuridica: rubro,
        actualizadoEn: new Date().toISOString(),
      });
      return;
    }

    this.asegurarFichaEnMemoria(id);
    const stub = this.fichasEnMemoria.get(id)!;
    this.guardarEnMemoria({
      ...stub,
      rubroPublicacionJuridica: rubro,
      actualizadoEn: new Date().toISOString(),
    });
  }

  private actualizarRubroDistincionEnMemoria(fichaId: string, rubro: RubroDistincion): void {
    const id = fichaId.trim();
    const existente = this.fichasEnMemoria.get(id);
    if (existente) {
      this.guardarEnMemoria({
        ...existente,
        rubroDistincion: rubro,
        actualizadoEn: new Date().toISOString(),
      });
      return;
    }

    this.asegurarFichaEnMemoria(id);
    const stub = this.fichasEnMemoria.get(id)!;
    this.guardarEnMemoria({
      ...stub,
      rubroDistincion: rubro,
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

  private obtenerIdRubroAmag(): number {
    const rubro = this.rubrosMaestro.rubros().find((item) => item.codigo === 'D');
    if (!rubro) {
      throw new ErrorNegocioApi({
        mensaje: 'No se encontró el rubro D en el catálogo maestro.',
      });
    }
    return rubro.idRubro;
  }

  private obtenerIdRubroIdioma(): number {
    const rubro = this.rubrosMaestro.rubros().find((item) => item.codigo === 'F');
    if (!rubro) {
      throw new ErrorNegocioApi({
        mensaje: 'No se encontró el rubro F en el catálogo maestro.',
      });
    }
    return rubro.idRubro;
  }

  private obtenerIdRubroPublicacionJuridica(): number {
    const rubro = this.rubrosMaestro.rubros().find((item) => item.codigo === 'G');
    if (!rubro) {
      throw new ErrorNegocioApi({
        mensaje: 'No se encontró el rubro G en el catálogo maestro.',
      });
    }
    return rubro.idRubro;
  }

  private obtenerIdRubroDistincion(): number {
    const rubro = this.rubrosMaestro.rubros().find((item) => item.codigo === 'H');
    if (!rubro) {
      throw new ErrorNegocioApi({
        mensaje: 'No se encontró el rubro H en el catálogo maestro.',
      });
    }
    return rubro.idRubro;
  }

  private obtenerIdRubroDocencia(): number {
    const rubro = this.rubrosMaestro.rubros().find((item) => item.codigo === 'I');
    if (!rubro) {
      throw new ErrorNegocioApi({
        mensaje: 'No se encontró el rubro I en el catálogo maestro.',
      });
    }
    return rubro.idRubro;
  }

  private obtenerIdRubroDemerito(): number {
    const rubro = this.rubrosMaestro.rubros().find((item) => item.codigo === 'J');
    if (!rubro) {
      throw new ErrorNegocioApi({
        mensaje: 'No se encontró el rubro J en el catálogo maestro.',
      });
    }
    return rubro.idRubro;
  }

  private obtenerIdRubroEstudiosPosgrado(): number {
    const rubro = this.rubrosMaestro.rubros().find((item) => item.codigo === 'E');
    if (!rubro) {
      throw new ErrorNegocioApi({
        mensaje: 'No se encontró el rubro E en el catálogo maestro.',
      });
    }
    return rubro.idRubro;
  }

  /**
   * El listado de deméritos no trae el subtotal. Tras guardar o eliminar
   * se vuelve a leer la ficha para refrescar esa suma y el total.
   */
  private refrescarFichaTrasDemerito(fichaId: string): Observable<FichaValoracion> {
    return this.obtenerPorId(fichaId).pipe(
      catchError(() => of(this.conSumaLocalDemerito(fichaId)))
    );
  }

  private aplicarSubtotalDemerito(
    ficha: FichaValoracion,
    rubros: ObtenerFichaResponse['data']['rubros']
  ): FichaValoracion {
    const puntaje = puntajeSubtotalPorCodigo(rubros, 'J');
    if (puntaje == null) {
      return ficha;
    }

    const rubro = ficha.rubroDemerito ?? crearRubroDemeritoVacio();
    return this.guardarEnMemoria({
      ...ficha,
      rubroDemerito: {
        ...rubro,
        puntajeTotal: puntaje,
      },
    });
  }

  private conSumaLocalDemerito(fichaId: string): FichaValoracion {
    const actual = this.fichasEnMemoria.get(fichaId.trim());
    if (!actual) {
      throw new ErrorNegocioApi({
        mensaje: 'No se pudo refrescar el puntaje de la ficha.',
      });
    }

    const rubro = actual.rubroDemerito ?? crearRubroDemeritoVacio();
    const suma = rubro.items.reduce((total, item) => total + (Number(item.puntaje) || 0), 0);
    return this.guardarEnMemoria({
      ...actual,
      rubroDemerito: {
        ...rubro,
        puntajeTotal: suma,
      },
    });
  }

  private actualizarRubroDemeritoEnMemoria(fichaId: string, rubro: RubroDemerito): void {
    const id = fichaId.trim();
    const existente = this.fichasEnMemoria.get(id);
    if (existente) {
      this.guardarEnMemoria({
        ...existente,
        rubroDemerito: rubro,
        actualizadoEn: new Date().toISOString(),
      });
      return;
    }

    this.asegurarFichaEnMemoria(id);
    const stub = this.fichasEnMemoria.get(id)!;
    this.guardarEnMemoria({
      ...stub,
      rubroDemerito: rubro,
      actualizadoEn: new Date().toISOString(),
    });
  }

  /**
   * El listado de docencia no trae el subtotal topado. Tras guardar o eliminar
   * se vuelve a leer la ficha para refrescar ese subtotal y el total.
   */
  private refrescarFichaTrasDocencia(fichaId: string): Observable<FichaValoracion> {
    return this.obtenerPorId(fichaId).pipe(
      catchError(() => of(this.conTopeLocalDocencia(fichaId)))
    );
  }

  private aplicarSubtotalDocencia(
    ficha: FichaValoracion,
    rubros: ObtenerFichaResponse['data']['rubros']
  ): FichaValoracion {
    const puntaje = puntajeSubtotalPorCodigo(rubros, 'I');
    if (puntaje == null) {
      return ficha;
    }

    const rubro = ficha.rubroDocencia ?? crearRubroDocenciaVacio();
    return this.guardarEnMemoria({
      ...ficha,
      rubroDocencia: {
        ...rubro,
        puntajeTotal: puntaje,
      },
    });
  }

  private conTopeLocalDocencia(fichaId: string): FichaValoracion {
    const actual = this.fichasEnMemoria.get(fichaId.trim());
    if (!actual) {
      throw new ErrorNegocioApi({
        mensaje: 'No se pudo refrescar el puntaje de la ficha.',
      });
    }

    const rubro = actual.rubroDocencia ?? crearRubroDocenciaVacio();
    const suma = rubro.items.reduce((total, item) => total + (Number(item.puntaje) || 0), 0);
    return this.guardarEnMemoria({
      ...actual,
      rubroDocencia: {
        ...rubro,
        puntajeTotal: Math.min(TOPE_PUNTAJE_RUBRO_DOCENCIA, suma),
      },
    });
  }

  /**
   * El listado de semestres no trae el subtotal topado. Tras guardar o eliminar
   * se vuelve a leer la ficha para refrescar ese subtotal y el total.
   */
  private refrescarFichaTrasEstudiosPosgrado(fichaId: string): Observable<FichaValoracion> {
    return this.obtenerPorId(fichaId).pipe(
      catchError(() => of(this.conTopeLocalEstudiosPosgrado(fichaId)))
    );
  }

  private aplicarSubtotalEstudiosPosgrado(
    ficha: FichaValoracion,
    rubros: ObtenerFichaResponse['data']['rubros']
  ): FichaValoracion {
    const puntaje =
      puntajeSubtotalPorCodigo(rubros, 'E1') ?? puntajeSubtotalPorCodigo(rubros, 'E');
    if (puntaje == null) {
      return ficha;
    }

    const rubro = ficha.rubroEstudiosPosgrado ?? crearRubroEstudiosPosgradoVacio();
    return this.guardarEnMemoria({
      ...ficha,
      rubroEstudiosPosgrado: {
        ...rubro,
        puntajeTotal: puntaje,
      },
    });
  }

  private conTopeLocalEstudiosPosgrado(fichaId: string): FichaValoracion {
    const actual = this.fichasEnMemoria.get(fichaId.trim());
    if (!actual) {
      throw new ErrorNegocioApi({
        mensaje: 'No se pudo refrescar el puntaje de la ficha.',
      });
    }

    const rubro = actual.rubroEstudiosPosgrado ?? crearRubroEstudiosPosgradoVacio();
    const suma = rubro.items.reduce((total, item) => total + (Number(item.puntaje) || 0), 0);
    return this.guardarEnMemoria({
      ...actual,
      rubroEstudiosPosgrado: {
        ...rubro,
        puntajeTotal: Math.min(TOPE_PUNTAJE_ESTUDIOS_POSGRADO, suma),
      },
    });
  }

  private actualizarRubroEstudiosPosgradoEnMemoria(
    fichaId: string,
    rubro: RubroEstudiosPosgrado
  ): void {
    const id = fichaId.trim();
    const existente = this.fichasEnMemoria.get(id);
    if (existente) {
      this.guardarEnMemoria({
        ...existente,
        rubroEstudiosPosgrado: rubro,
        actualizadoEn: new Date().toISOString(),
      });
      return;
    }

    this.asegurarFichaEnMemoria(id);
    const stub = this.fichasEnMemoria.get(id)!;
    this.guardarEnMemoria({
      ...stub,
      rubroEstudiosPosgrado: rubro,
      actualizadoEn: new Date().toISOString(),
    });
  }

  /**
   * El listado no trae el subtotal topado del subrubro. Tras guardar o eliminar
   * se vuelve a leer la ficha: si viene el código E2 se usa ese puntaje.
   */
  private refrescarFichaTrasPasantias(fichaId: string): Observable<FichaValoracion> {
    return this.obtenerPorId(fichaId).pipe(
      catchError(() => of(this.conTopeLocalPasantias(fichaId)))
    );
  }

  private aplicarSubtotalPasantias(
    ficha: FichaValoracion,
    rubros: ObtenerFichaResponse['data']['rubros']
  ): FichaValoracion {
    const rubro = ficha.rubroPasantias ?? crearRubroPasantiasVacio();
    const oficial = puntajeSubtotalPorCodigo(rubros, 'E2');
    return this.guardarEnMemoria({
      ...ficha,
      rubroPasantias: {
        ...rubro,
        puntajeTotal: oficial ?? puntajeSubrubroPasantias(rubro.items),
      },
    });
  }

  private conTopeLocalPasantias(fichaId: string): FichaValoracion {
    const actual = this.fichasEnMemoria.get(fichaId.trim());
    if (!actual) {
      throw new ErrorNegocioApi({
        mensaje: 'No se pudo refrescar el puntaje de la ficha.',
      });
    }

    const rubro = actual.rubroPasantias ?? crearRubroPasantiasVacio();
    return this.guardarEnMemoria({
      ...actual,
      rubroPasantias: {
        ...rubro,
        puntajeTotal: puntajeSubrubroPasantias(rubro.items),
      },
    });
  }

  /**
   * El listado no trae el subtotal topado del subrubro. Tras guardar o eliminar
   * se vuelve a leer la ficha: si viene el código E3 se usa ese puntaje.
   */
  private refrescarFichaTrasCursosEspecializacion(fichaId: string): Observable<FichaValoracion> {
    return this.obtenerPorId(fichaId).pipe(
      catchError(() => of(this.conTopeLocalCursosEspecializacion(fichaId)))
    );
  }

  private aplicarSubtotalCursosEspecializacion(
    ficha: FichaValoracion,
    rubros: ObtenerFichaResponse['data']['rubros']
  ): FichaValoracion {
    const rubro = ficha.rubroCursosEspecializacion ?? crearRubroCursosEspecializacionVacio();
    const oficial = puntajeSubtotalPorCodigo(rubros, 'E3');
    return this.guardarEnMemoria({
      ...ficha,
      rubroCursosEspecializacion: {
        ...rubro,
        puntajeTotal: oficial ?? puntajeSubrubroCursosEspecializacion(rubro.items),
      },
    });
  }

  private conTopeLocalCursosEspecializacion(fichaId: string): FichaValoracion {
    const actual = this.fichasEnMemoria.get(fichaId.trim());
    if (!actual) {
      throw new ErrorNegocioApi({
        mensaje: 'No se pudo refrescar el puntaje de la ficha.',
      });
    }

    const rubro = actual.rubroCursosEspecializacion ?? crearRubroCursosEspecializacionVacio();
    return this.guardarEnMemoria({
      ...actual,
      rubroCursosEspecializacion: {
        ...rubro,
        puntajeTotal: puntajeSubrubroCursosEspecializacion(rubro.items),
      },
    });
  }

  /**
   * El listado no trae el subtotal topado del subrubro. Tras guardar o eliminar
   * se vuelve a leer la ficha: si viene el código E4 se usa ese puntaje.
   */
  private refrescarFichaTrasCertamenesAcademicos(fichaId: string): Observable<FichaValoracion> {
    return this.obtenerPorId(fichaId).pipe(
      catchError(() => of(this.conTopeLocalCertamenesAcademicos(fichaId)))
    );
  }

  private aplicarSubtotalCertamenesAcademicos(
    ficha: FichaValoracion,
    rubros: ObtenerFichaResponse['data']['rubros']
  ): FichaValoracion {
    const rubro = ficha.rubroCertamenesAcademicos ?? crearRubroCertamenesAcademicosVacio();
    const oficial = puntajeSubtotalPorCodigo(rubros, 'E4');
    return this.guardarEnMemoria({
      ...ficha,
      rubroCertamenesAcademicos: {
        ...rubro,
        puntajeTotal: oficial ?? puntajeSubrubroCertamenesAcademicos(rubro.items),
      },
    });
  }

  private conTopeLocalCertamenesAcademicos(fichaId: string): FichaValoracion {
    const actual = this.fichasEnMemoria.get(fichaId.trim());
    if (!actual) {
      throw new ErrorNegocioApi({
        mensaje: 'No se pudo refrescar el puntaje de la ficha.',
      });
    }

    const rubro = actual.rubroCertamenesAcademicos ?? crearRubroCertamenesAcademicosVacio();
    return this.guardarEnMemoria({
      ...actual,
      rubroCertamenesAcademicos: {
        ...rubro,
        puntajeTotal: puntajeSubrubroCertamenesAcademicos(rubro.items),
      },
    });
  }

  /**
   * El listado no trae el subtotal topado del subrubro. Tras guardar o eliminar
   * se vuelve a leer la ficha: si viene el código E5 se usa ese puntaje.
   */
  private refrescarFichaTrasAsistenciasEventos(fichaId: string): Observable<FichaValoracion> {
    return this.obtenerPorId(fichaId).pipe(
      catchError(() => of(this.conTopeLocalAsistenciasEventos(fichaId)))
    );
  }

  private aplicarSubtotalAsistenciasEventos(
    ficha: FichaValoracion,
    rubros: ObtenerFichaResponse['data']['rubros']
  ): FichaValoracion {
    const rubro = ficha.rubroAsistenciasEventos ?? crearRubroAsistenciasEventosVacio();
    const oficial = puntajeSubtotalPorCodigo(rubros, 'E5');
    return this.guardarEnMemoria({
      ...ficha,
      rubroAsistenciasEventos: {
        ...rubro,
        puntajeTotal: oficial ?? puntajeSubrubroAsistenciasEventos(rubro.items),
      },
    });
  }

  private conTopeLocalAsistenciasEventos(fichaId: string): FichaValoracion {
    const actual = this.fichasEnMemoria.get(fichaId.trim());
    if (!actual) {
      throw new ErrorNegocioApi({
        mensaje: 'No se pudo refrescar el puntaje de la ficha.',
      });
    }

    const rubro = actual.rubroAsistenciasEventos ?? crearRubroAsistenciasEventosVacio();
    return this.guardarEnMemoria({
      ...actual,
      rubroAsistenciasEventos: {
        ...rubro,
        puntajeTotal: puntajeSubrubroAsistenciasEventos(rubro.items),
      },
    });
  }

  private actualizarRubroAsistenciasEventosEnMemoria(
    fichaId: string,
    rubro: RubroAsistenciasEventos
  ): void {
    const id = fichaId.trim();
    const existente = this.fichasEnMemoria.get(id);
    if (existente) {
      this.guardarEnMemoria({
        ...existente,
        rubroAsistenciasEventos: rubro,
        actualizadoEn: new Date().toISOString(),
      });
      return;
    }

    this.asegurarFichaEnMemoria(id);
    const stub = this.fichasEnMemoria.get(id)!;
    this.guardarEnMemoria({
      ...stub,
      rubroAsistenciasEventos: rubro,
      actualizadoEn: new Date().toISOString(),
    });
  }

  /**
   * El listado no trae el subtotal topado del subrubro. Tras guardar o eliminar
   * se vuelve a leer la ficha: si viene el código E6 se usa ese puntaje.
   */
  private refrescarFichaTrasOfimatica(fichaId: string): Observable<FichaValoracion> {
    return this.obtenerPorId(fichaId).pipe(
      catchError(() => of(this.conTopeLocalOfimatica(fichaId)))
    );
  }

  private aplicarSubtotalOfimatica(
    ficha: FichaValoracion,
    rubros: ObtenerFichaResponse['data']['rubros']
  ): FichaValoracion {
    const rubro = ficha.rubroOfimatica ?? crearRubroOfimaticaVacio();
    const oficial = puntajeSubtotalPorCodigo(rubros, 'E6');
    return this.guardarEnMemoria({
      ...ficha,
      rubroOfimatica: {
        ...rubro,
        puntajeTotal: oficial ?? puntajeSubrubroOfimatica(rubro.items),
      },
    });
  }

  private conTopeLocalOfimatica(fichaId: string): FichaValoracion {
    const actual = this.fichasEnMemoria.get(fichaId.trim());
    if (!actual) {
      throw new ErrorNegocioApi({
        mensaje: 'No se pudo refrescar el puntaje de la ficha.',
      });
    }

    const rubro = actual.rubroOfimatica ?? crearRubroOfimaticaVacio();
    return this.guardarEnMemoria({
      ...actual,
      rubroOfimatica: {
        ...rubro,
        puntajeTotal: puntajeSubrubroOfimatica(rubro.items),
      },
    });
  }

  private actualizarRubroOfimaticaEnMemoria(fichaId: string, rubro: RubroOfimatica): void {
    const id = fichaId.trim();
    const existente = this.fichasEnMemoria.get(id);
    if (existente) {
      this.guardarEnMemoria({
        ...existente,
        rubroOfimatica: rubro,
        actualizadoEn: new Date().toISOString(),
      });
      return;
    }

    this.asegurarFichaEnMemoria(id);
    const stub = this.fichasEnMemoria.get(id)!;
    this.guardarEnMemoria({
      ...stub,
      rubroOfimatica: rubro,
      actualizadoEn: new Date().toISOString(),
    });
  }

  private actualizarRubroCertamenesAcademicosEnMemoria(
    fichaId: string,
    rubro: RubroCertamenesAcademicos
  ): void {
    const id = fichaId.trim();
    const existente = this.fichasEnMemoria.get(id);
    if (existente) {
      this.guardarEnMemoria({
        ...existente,
        rubroCertamenesAcademicos: rubro,
        actualizadoEn: new Date().toISOString(),
      });
      return;
    }

    this.asegurarFichaEnMemoria(id);
    const stub = this.fichasEnMemoria.get(id)!;
    this.guardarEnMemoria({
      ...stub,
      rubroCertamenesAcademicos: rubro,
      actualizadoEn: new Date().toISOString(),
    });
  }

  private actualizarRubroCursosEspecializacionEnMemoria(
    fichaId: string,
    rubro: RubroCursosEspecializacion
  ): void {
    const id = fichaId.trim();
    const existente = this.fichasEnMemoria.get(id);
    if (existente) {
      this.guardarEnMemoria({
        ...existente,
        rubroCursosEspecializacion: rubro,
        actualizadoEn: new Date().toISOString(),
      });
      return;
    }

    this.asegurarFichaEnMemoria(id);
    const stub = this.fichasEnMemoria.get(id)!;
    this.guardarEnMemoria({
      ...stub,
      rubroCursosEspecializacion: rubro,
      actualizadoEn: new Date().toISOString(),
    });
  }

  private actualizarRubroPasantiasEnMemoria(fichaId: string, rubro: RubroPasantias): void {
    const id = fichaId.trim();
    const existente = this.fichasEnMemoria.get(id);
    if (existente) {
      this.guardarEnMemoria({
        ...existente,
        rubroPasantias: rubro,
        actualizadoEn: new Date().toISOString(),
      });
      return;
    }

    this.asegurarFichaEnMemoria(id);
    const stub = this.fichasEnMemoria.get(id)!;
    this.guardarEnMemoria({
      ...stub,
      rubroPasantias: rubro,
      actualizadoEn: new Date().toISOString(),
    });
  }

  private actualizarRubroDocenciaEnMemoria(fichaId: string, rubro: RubroDocencia): void {
    const id = fichaId.trim();
    const existente = this.fichasEnMemoria.get(id);
    if (existente) {
      this.guardarEnMemoria({
        ...existente,
        rubroDocencia: rubro,
        actualizadoEn: new Date().toISOString(),
      });
      return;
    }

    this.asegurarFichaEnMemoria(id);
    const stub = this.fichasEnMemoria.get(id)!;
    this.guardarEnMemoria({
      ...stub,
      rubroDocencia: rubro,
      actualizadoEn: new Date().toISOString(),
    });
  }

  private asegurarTokenOpciones(): void {
    if (this.sesion.getTokenNivel() !== tokenNiveles.NIVEL_OPCIONES) {
      throw new Error(
        'Se requiere una sesión con perfil cargado para gestionar fichas.'
      );
    }
  }
}
