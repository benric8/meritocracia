import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogoItem } from '../../../domain/models/catalogo-item.model';
import { NivelTitular } from '../../../domain/models/nivel-titular.model';
import { RubroMaestro } from '../../../domain/models/rubro-maestro.model';
import { SubrubroMaestro } from '../../../domain/models/subrubro-maestro.model';
import { MaestrosPort } from '../../../domain/ports/maestros.port';
import { MaestrosHttpAdapter } from '../http/maestros-http.adapter';
import { MaestrosMockAdapter } from './maestros-mock.adapter';

/**
 * Maestros reales vía HTTP; catálogos del rubro C mock hasta que el backend esté listo.
 * Sustituir por `MaestrosHttpAdapter` cuando `nivel-grado`, `universidades` y `paises` estén disponibles.
 */
@Injectable({ providedIn: 'root' })
export class MaestrosHttpGradosTitulosMockAdapter implements MaestrosPort {
  private readonly http = inject(MaestrosHttpAdapter);
  private readonly mock = inject(MaestrosMockAdapter);

  listarNivelesTitular(): Observable<NivelTitular[]> {
    return this.http.listarNivelesTitular();
  }

  listarDistritosJudiciales(): Observable<CatalogoItem[]> {
    return this.http.listarDistritosJudiciales();
  }

  listarCargosTitular(cargoMagistradoId: string): Observable<CatalogoItem[]> {
    return this.http.listarCargosTitular(cargoMagistradoId);
  }

  listarCargosProvisional(cargoMagistradoId: string): Observable<CatalogoItem[]> {
    return this.http.listarCargosProvisional(cargoMagistradoId);
  }

  listarEspecialidades(): Observable<CatalogoItem[]> {
    return this.http.listarEspecialidades();
  }

  listarNivelesInmediatosAnteriores(cargoMagistradoId: string): Observable<CatalogoItem[]> {
    return this.http.listarNivelesInmediatosAnteriores(cargoMagistradoId);
  }

  listarColegiosAbogados(): Observable<CatalogoItem[]> {
    return this.http.listarColegiosAbogados();
  }

  listarNivelesGrado(): Observable<CatalogoItem[]> {
    return this.mock.listarNivelesGrado();
  }

  listarUniversidades(): Observable<CatalogoItem[]> {
    return this.mock.listarUniversidades();
  }

  listarPaises(): Observable<CatalogoItem[]> {
    return this.mock.listarPaises();
  }

  listarTiposCursoAmag(): Observable<CatalogoItem[]> {
    return this.mock.listarTiposCursoAmag();
  }

  listarRubros(): Observable<RubroMaestro[]> {
    return this.http.listarRubros();
  }

  listarSubrubros(idRubro: number): Observable<SubrubroMaestro[]> {
    return this.http.listarSubrubros(idRubro);
  }
}
