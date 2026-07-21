import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogoItem } from '../models/catalogo-item.model';
import { NivelTitular } from '../models/nivel-titular.model';

/**
 * Puerto de salida: catálogos maestros (RF006 — ficha de valoración).
 * Los catálogos de cargo dependen del cargo de magistrado seleccionado en cabecera.
 */
export interface MaestrosPort {
  listarNivelesTitular(): Observable<NivelTitular[]>;
  listarDistritosJudiciales(): Observable<CatalogoItem[]>;
  /** Cargo titular actual según `cargoMagistradoId` de la ficha. */
  listarCargosTitular(cargoMagistradoId: string): Observable<CatalogoItem[]>;
  /** Cargo de provisionalidad según el cargo de magistrado de la ficha. */
  listarCargosProvisional(cargoMagistradoId: string): Observable<CatalogoItem[]>;
  listarEspecialidades(): Observable<CatalogoItem[]>;
  /** Cargo/nivel inmediato anterior según el cargo de magistrado de la ficha. */
  listarNivelesInmediatosAnteriores(cargoMagistradoId: string): Observable<CatalogoItem[]>;
  listarColegiosAbogados(): Observable<CatalogoItem[]>;
  listarNivelesGrado(): Observable<CatalogoItem[]>;
  listarUniversidades(): Observable<CatalogoItem[]>;
  listarPaises(): Observable<CatalogoItem[]>;
  listarTiposCursoAmag(): Observable<CatalogoItem[]>;
}

export const MAESTROS_PORT = new InjectionToken<MaestrosPort>('MAESTROS_PORT');
