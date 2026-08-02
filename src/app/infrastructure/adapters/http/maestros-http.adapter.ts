import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, throwError } from 'rxjs';
import { tokenNiveles } from '../../../domain/commons/constants';
import { CatalogoItem } from '../../../domain/models/catalogo-item.model';
import { IdiomaCatalogoItem, TipoIdioma } from '../../../domain/models/rubro-idioma.model';
import { NivelTitular } from '../../../domain/models/nivel-titular.model';
import { RubroMaestro } from '../../../domain/models/rubro-maestro.model';
import { SubrubroMaestro } from '../../../domain/models/subrubro-maestro.model';
import { MaestrosPort } from '../../../domain/ports/maestros.port';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { assertRespuestaExitosa } from '../../api/api-response.util';
import { mapearAErrorNegocioApi } from '../../api/mapear-error-negocio.operator';
import { maestrosEndpoints } from '../../api/maestros-api.constants';
import { getAppConfig } from '../../config/app-runtime-config';
import {
  ListarColegiosProfesionalesResponse,
  ListarDistritosJudicialesResponse,
  ListarMaestrosDescripcionResponse,
  ListarPaisesResponse,
  ListarUniversidadesResponse,
  ObtenerCargoMagistradoResponse,
  ObtenerMaestroDescripcionResponse,
} from '../../dto/remote/MaestrosCatalogoResponse.dto';
import {
  ListarIdiomasResponse,
  ListarNivelesIdiomaResponse,
  ListarTiposDocumentoIdiomaResponse,
} from '../../dto/remote/MaestrosIdiomaResponse.dto';
import { ListarTiposPublicacionResponse } from '../../dto/remote/MaestrosPublicacionResponse.dto';
import {
  ListarTiposDocumentoDistincionResponse,
  ListarTiposDistincionResponse,
} from '../../dto/remote/MaestrosDistincionResponse.dto';
import { ListarNivelesTitularResponse } from '../../dto/remote/MaestrosNivelResponse.dto';
import { ListarRubrosMaestroResponse, ListarSubrubrosMaestroResponse } from '../../dto/remote/MaestrosRubroResponse.dto';
import {
  aListaCatalogoUnico,
  toCatalogoDesdeCargoMagistrado,
  toCatalogoDesdeColegio,
  toCatalogoDesdeDescripcion,
  toCatalogoDesdeDistrito,
  toCatalogoDesdePais,
  toCatalogoDesdeUniversidad,
} from '../../mappers/maestros-catalogo.mapper';
import {
  toCatalogoDesdeNivelIdioma,
  toCatalogoDesdeTipoDocumentoIdioma,
  toIdiomaDesdeDto,
} from '../../mappers/maestros-idioma.mapper';
import { toNivelTitular } from '../../mappers/nivel-titular.mapper';
import { toRubroMaestro } from '../../mappers/rubro-maestro.mapper';
import { toSubrubroMaestro } from '../../mappers/subrubro-maestro.mapper';
import { toCatalogoDesdeTipoPublicacion } from '../../mappers/maestros-publicacion.mapper';
import {
  toCatalogoDesdeTipoDocumentoDistincion,
  toTipoDistincionDesdeDto,
} from '../../mappers/maestros-distincion.mapper';
import { TipoDistincionCatalogoItem } from '../../../domain/models/rubro-distincion.model';

@Injectable({ providedIn: 'root' })
export class MaestrosHttpAdapter implements MaestrosPort {
  private readonly http = inject(HttpClient);
  private readonly sesion = inject(SESION_PORT);

  private get baseUrl(): string {
    return getAppConfig().urlApi;
  }

  listarNivelesTitular(): Observable<NivelTitular[]> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<ListarNivelesTitularResponse>(
        `${this.baseUrl}${maestrosEndpoints.CARGOS_MAGISTRADO_EVALUADAS}`
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return this.mapearLista(respuesta.data, toNivelTitular);
        }),
        mapearAErrorNegocioApi('No se pudo cargar el catálogo de cargos de magistrado.')
      );
  }

  listarDistritosJudiciales(): Observable<CatalogoItem[]> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<ListarDistritosJudicialesResponse>(
        `${this.baseUrl}${maestrosEndpoints.DISTRITO_JUDICIAL}`
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return this.mapearLista(respuesta.data, toCatalogoDesdeDistrito);
        }),
        mapearAErrorNegocioApi('No se pudo cargar el catálogo de distritos judiciales.')
      );
  }

  listarCargosTitular(cargoMagistradoId: string): Observable<CatalogoItem[]> {
    const id = cargoMagistradoId?.trim() ?? '';
    if (!id) {
      return of([]);
    }

    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<ObtenerCargoMagistradoResponse>(
        `${this.baseUrl}${maestrosEndpoints.CARGO_MAGISTRADO(id)}`
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return aListaCatalogoUnico(respuesta.data, toCatalogoDesdeCargoMagistrado);
        }),
        mapearAErrorNegocioApi('No se pudo cargar el cargo titular actual.')
      );
  }

  listarCargosProvisional(cargoMagistradoId: string): Observable<CatalogoItem[]> {
    const id = cargoMagistradoId?.trim() ?? '';
    if (!id) {
      return of([]);
    }

    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<ObtenerMaestroDescripcionResponse>(
        `${this.baseUrl}${maestrosEndpoints.CARGO_MAGISTRADO_PROVISIONALIDAD(id)}`
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return aListaCatalogoUnico(respuesta.data, toCatalogoDesdeDescripcion);
        }),
        mapearAErrorNegocioApi('No se pudo cargar el cargo de provisionalidad.')
      );
  }

  listarEspecialidades(): Observable<CatalogoItem[]> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<ListarMaestrosDescripcionResponse>(
        `${this.baseUrl}${maestrosEndpoints.ESPECIALIDADES}`
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return this.mapearLista(respuesta.data, toCatalogoDesdeDescripcion);
        }),
        mapearAErrorNegocioApi('No se pudo cargar el catálogo de especialidades.')
      );
  }

  listarNivelesInmediatosAnteriores(cargoMagistradoId: string): Observable<CatalogoItem[]> {
    const id = cargoMagistradoId?.trim() ?? '';
    if (!id) {
      return of([]);
    }

    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<ObtenerMaestroDescripcionResponse>(
        `${this.baseUrl}${maestrosEndpoints.CARGO_MAGISTRADO_ANTERIOR(id)}`
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return aListaCatalogoUnico(respuesta.data, toCatalogoDesdeDescripcion);
        }),
        mapearAErrorNegocioApi('No se pudo cargar el cargo inmediato anterior.')
      );
  }

  listarColegiosAbogados(): Observable<CatalogoItem[]> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<ListarColegiosProfesionalesResponse>(
        `${this.baseUrl}${maestrosEndpoints.COLEGIOS_PROFESIONALES}`
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return this.mapearLista(respuesta.data, toCatalogoDesdeColegio);
        }),
        mapearAErrorNegocioApi('No se pudo cargar el catálogo de colegios profesionales.')
      );
  }

  listarNivelesGrado(): Observable<CatalogoItem[]> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<ListarMaestrosDescripcionResponse>(
        `${this.baseUrl}${maestrosEndpoints.NIVEL_GRADO}`
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return this.mapearLista(respuesta.data, toCatalogoDesdeDescripcion);
        }),
        mapearAErrorNegocioApi('No se pudo cargar el catálogo de niveles de grado.')
      );
  }

  listarUniversidades(): Observable<CatalogoItem[]> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<ListarUniversidadesResponse>(
        `${this.baseUrl}${maestrosEndpoints.UNIVERSIDADES}`
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return this.mapearLista(respuesta.data, toCatalogoDesdeUniversidad);
        }),
        mapearAErrorNegocioApi('No se pudo cargar el catálogo de universidades.')
      );
  }

  buscarUniversidades(
    termino: string,
    paisId?: string,
    _limite = 20
  ): Observable<CatalogoItem[]> {
    const pais = paisId?.trim() ?? '';
    if (!pais) {
      return of([]);
    }

    return this.buscarInstitucionesPorTipo(termino, 1, pais);
  }

  buscarInstitucionesIdioma(termino: string): Observable<CatalogoItem[]> {
    return this.buscarInstitucionesPorTipo(termino, 2);
  }

  private buscarInstitucionesPorTipo(
    termino: string,
    tipoInstitucionId: number,
    paisId?: string
  ): Observable<CatalogoItem[]> {
    const texto = termino.trim();
    if (texto.length < 2) {
      return of([]);
    }

    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    let params = new HttpParams()
      .set('termino', texto)
      .set('tipo_institucion_id', String(tipoInstitucionId));

    const pais = paisId?.trim() ?? '';
    if (pais) {
      params = params.set('pais_id', pais);
    }

    return this.http
      .get<ListarUniversidadesResponse>(
        `${this.baseUrl}${maestrosEndpoints.INSTITUCIONES_BUSCAR}`,
        { params }
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return this.mapearLista(respuesta.data, toCatalogoDesdeUniversidad);
        }),
        mapearAErrorNegocioApi('No se pudo buscar instituciones.')
      );
  }

  listarPaises(): Observable<CatalogoItem[]> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<ListarPaisesResponse>(`${this.baseUrl}${maestrosEndpoints.PAISES}`)
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return this.mapearLista(respuesta.data, toCatalogoDesdePais);
        }),
        mapearAErrorNegocioApi('No se pudo cargar el catálogo de países.')
      );
  }

  listarRubros(): Observable<RubroMaestro[]> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<ListarRubrosMaestroResponse>(`${this.baseUrl}${maestrosEndpoints.RUBROS}`)
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return this.mapearLista(respuesta.data, toRubroMaestro);
        }),
        mapearAErrorNegocioApi('No se pudo cargar el catálogo de rubros.')
      );
  }

  listarSubrubros(idRubro: number): Observable<SubrubroMaestro[]> {
    if (!Number.isFinite(idRubro) || idRubro <= 0) {
      return of([]);
    }

    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<ListarSubrubrosMaestroResponse>(
        `${this.baseUrl}${maestrosEndpoints.SUBRUBROS(idRubro)}`
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return this.mapearLista(respuesta.data, toSubrubroMaestro);
        }),
        mapearAErrorNegocioApi('No se pudo cargar el catálogo de subrubros.')
      );
  }

  listarTiposCursoAmag(): Observable<CatalogoItem[]> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<ListarMaestrosDescripcionResponse>(
        `${this.baseUrl}${maestrosEndpoints.TIPO_CURSO_AMAG}`
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return this.mapearLista(respuesta.data, toCatalogoDesdeDescripcion);
        }),
        mapearAErrorNegocioApi('No se pudo cargar el catálogo de tipos de curso AMAG.')
      );
  }

  listarIdiomas(tipo?: TipoIdioma): Observable<IdiomaCatalogoItem[]> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    let params = new HttpParams();
    if (tipo) {
      params = params.set('tipo', tipo);
    }

    return this.http
      .get<ListarIdiomasResponse>(`${this.baseUrl}${maestrosEndpoints.IDIOMAS}`, { params })
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return this.mapearLista(respuesta.data, toIdiomaDesdeDto);
        }),
        mapearAErrorNegocioApi('No se pudo cargar el catálogo de idiomas.')
      );
  }

  listarNivelesIdioma(): Observable<CatalogoItem[]> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<ListarNivelesIdiomaResponse>(
        `${this.baseUrl}${maestrosEndpoints.NIVELES_IDIOMA}`
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return this.mapearLista(respuesta.data, toCatalogoDesdeNivelIdioma);
        }),
        mapearAErrorNegocioApi('No se pudo cargar el catálogo de niveles de idioma.')
      );
  }

  listarTiposDocumentoIdioma(): Observable<CatalogoItem[]> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<ListarTiposDocumentoIdiomaResponse>(
        `${this.baseUrl}${maestrosEndpoints.TIPOS_DOCUMENTO_IDIOMA}`
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return this.mapearLista(respuesta.data, toCatalogoDesdeTipoDocumentoIdioma);
        }),
        mapearAErrorNegocioApi('No se pudo cargar el catálogo de tipos de documento.')
      );
  }

  listarTiposPublicacion(): Observable<CatalogoItem[]> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<ListarTiposPublicacionResponse>(
        `${this.baseUrl}${maestrosEndpoints.TIPOS_PUBLICACION}`
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return this.mapearLista(respuesta.data, toCatalogoDesdeTipoPublicacion);
        }),
        mapearAErrorNegocioApi('No se pudo cargar el catálogo de tipos de publicación.')
      );
  }

  listarTiposDocumentoDistincion(): Observable<CatalogoItem[]> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<ListarTiposDocumentoDistincionResponse>(
        `${this.baseUrl}${maestrosEndpoints.TIPOS_DOCUMENTO_DISTINCION}`
      )
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return this.mapearLista(respuesta.data, toCatalogoDesdeTipoDocumentoDistincion);
        }),
        mapearAErrorNegocioApi('No se pudo cargar el catálogo de tipos de documento distinción.')
      );
  }

  listarTiposDistincion(): Observable<TipoDistincionCatalogoItem[]> {
    try {
      this.asegurarTokenOpciones();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http
      .get<ListarTiposDistincionResponse>(`${this.baseUrl}${maestrosEndpoints.TIPOS_DISTINCION}`)
      .pipe(
        map((respuesta) => {
          assertRespuestaExitosa(respuesta);
          return this.mapearLista(respuesta.data, toTipoDistincionDesdeDto);
        }),
        mapearAErrorNegocioApi('No se pudo cargar el catálogo de tipos de distinción.')
      );
  }

  private mapearLista<TDto, TOut>(
    data: TDto[] | null | undefined,
    mapear: (dto: TDto) => TOut
  ): TOut[] {
    return (data ?? [])
      .map((dto) => {
        try {
          return mapear(dto);
        } catch {
          return null;
        }
      })
      .filter((item): item is TOut => item !== null);
  }

  private asegurarTokenOpciones(): void {
    if (this.sesion.getTokenNivel() !== tokenNiveles.NIVEL_OPCIONES) {
      throw new Error(
        'Se requiere una sesión con perfil cargado para consultar maestros.'
      );
    }
  }
}
