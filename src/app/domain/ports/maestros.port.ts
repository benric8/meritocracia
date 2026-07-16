import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogoItem } from '../models/catalogo-item.model';
import { NivelTitular } from '../models/nivel-titular.model';

/**
 * Puerto de salida: catálogos maestros (RF006 — ficha de valoración).
 */
export interface MaestrosPort {
  listarNivelesTitular(): Observable<NivelTitular[]>;
  listarDistritosJudiciales(): Observable<CatalogoItem[]>;
  listarCargosTitular(): Observable<CatalogoItem[]>;
  listarCargosProvisional(): Observable<CatalogoItem[]>;
  listarEspecialidades(): Observable<CatalogoItem[]>;
  listarNivelesInmediatosAnteriores(): Observable<CatalogoItem[]>;
  listarColegiosAbogados(): Observable<CatalogoItem[]>;
}

export const MAESTROS_PORT = new InjectionToken<MaestrosPort>('MAESTROS_PORT');
