import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { tokenNiveles } from '../../../domain/commons/constants';
import { CatalogoItem } from '../../../domain/models/catalogo-item.model';
import { NivelTitular } from '../../../domain/models/nivel-titular.model';
import { MaestrosPort } from '../../../domain/ports/maestros.port';
import { SESION_PORT } from '../../../domain/ports/sesion.port';
import { assertRespuestaExitosa } from '../../api/api-response.util';
import { mapearAErrorNegocioApi } from '../../api/mapear-error-negocio.operator';
import { maestrosEndpoints } from '../../api/maestros-api.constants';
import { getAppConfig } from '../../config/app-runtime-config';
import { ListarNivelesTitularResponse } from '../../dto/remote/MaestrosNivelResponse.dto';
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
          return (respuesta.data ?? [])
            .map((dto) => {
              try {
                return toNivelTitular(dto);
              } catch {
                return null;
              }
            })
            .filter((item): item is NivelTitular => item !== null);
        }),
        mapearAErrorNegocioApi('No se pudo cargar el catálogo de cargos de magistrado.')
      );
  }

  listarDistritosJudiciales(): Observable<CatalogoItem[]> {
    return this.noImplementado('distritos judiciales');
  }

  listarCargosTitular(): Observable<CatalogoItem[]> {
    return this.noImplementado('cargos titular');
  }

  listarCargosProvisional(): Observable<CatalogoItem[]> {
    return this.noImplementado('cargos provisional');
  }

  listarEspecialidades(): Observable<CatalogoItem[]> {
    return this.noImplementado('especialidades');
  }

  listarNivelesInmediatosAnteriores(): Observable<CatalogoItem[]> {
    return this.noImplementado('niveles inmediatos anteriores');
  }

  listarColegiosAbogados(): Observable<CatalogoItem[]> {
    return this.noImplementado('colegios de abogados');
  }

  private noImplementado(catalogo: string): Observable<CatalogoItem[]> {
    return throwError(
      () => new Error(`Catálogo HTTP de ${catalogo} aún no está disponible.`)
    );
  }

  private asegurarTokenOpciones(): void {
    if (this.sesion.getTokenNivel() !== tokenNiveles.NIVEL_OPCIONES) {
      throw new Error(
        'Se requiere una sesión con perfil cargado para consultar maestros.'
      );
    }
  }
}
