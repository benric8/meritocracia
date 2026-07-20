import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, throwError } from 'rxjs';
import { tokenNiveles } from '../../../domain/commons/constants';
import { CatalogoItem } from '../../../domain/models/catalogo-item.model';
import { NivelTitular } from '../../../domain/models/nivel-titular.model';
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
  ObtenerCargoMagistradoResponse,
  ObtenerMaestroDescripcionResponse,
} from '../../dto/remote/MaestrosCatalogoResponse.dto';
import { ListarNivelesTitularResponse } from '../../dto/remote/MaestrosNivelResponse.dto';
import {
  aListaCatalogoUnico,
  toCatalogoDesdeCargoMagistrado,
  toCatalogoDesdeColegio,
  toCatalogoDesdeDescripcion,
  toCatalogoDesdeDistrito,
} from '../../mappers/maestros-catalogo.mapper';
import { toNivelTitular } from '../../mappers/nivel-titular.mapper';

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
