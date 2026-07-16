import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { CatalogoItem } from '../../../domain/models/catalogo-item.model';
import { NivelTitular } from '../../../domain/models/nivel-titular.model';
import { MaestrosPort } from '../../../domain/ports/maestros.port';

const LATENCIA_MS = 300;

@Injectable({ providedIn: 'root' })
export class MaestrosMockAdapter implements MaestrosPort {
  listarNivelesTitular(): Observable<NivelTitular[]> {
    return of(this.nivelesTitular()).pipe(delay(LATENCIA_MS));
  }

  listarDistritosJudiciales(): Observable<CatalogoItem[]> {
    return of([
      { id: 'dj-huancavelica', nombre: 'Huancavelica' },
      { id: 'dj-lima', nombre: 'Lima' },
      { id: 'dj-arequipa', nombre: 'Arequipa' },
      { id: 'dj-cusco', nombre: 'Cusco' },
      { id: 'dj-la-libertad', nombre: 'La Libertad' },
    ]).pipe(delay(LATENCIA_MS));
  }

  listarCargosTitular(): Observable<CatalogoItem[]> {
    return of([
      { id: 'ct-supremo', nombre: 'Juez Supremo Titular' },
      { id: 'ct-superior', nombre: 'Juez Superior Titular' },
      { id: 'ct-especializado', nombre: 'Juez Especializado Titular' },
      { id: 'ct-paz', nombre: 'Juez de Paz Letrado Titular' },
    ]).pipe(delay(LATENCIA_MS));
  }

  listarCargosProvisional(): Observable<CatalogoItem[]> {
    return of([
      { id: 'cp-supremo', nombre: 'JUEZ SUPREMO' },
      { id: 'cp-superior', nombre: 'JUEZ SUPERIOR' },
      { id: 'cp-especializado', nombre: 'JUEZ ESPECIALIZADO' },
      { id: 'cp-paz', nombre: 'JUEZ DE PAZ LETRADO' },
    ]).pipe(delay(LATENCIA_MS));
  }

  listarEspecialidades(): Observable<CatalogoItem[]> {
    return of([
      { id: 'esp-civil', nombre: 'Civil' },
      { id: 'esp-penal', nombre: 'Penal' },
      { id: 'esp-laboral', nombre: 'Laboral' },
      { id: 'esp-familia', nombre: 'Familia' },
      { id: 'esp-contencioso', nombre: 'Contencioso Administrativo' },
      { id: 'esp-comercial', nombre: 'Comercial' },
    ]).pipe(delay(LATENCIA_MS));
  }

  listarNivelesInmediatosAnteriores(): Observable<CatalogoItem[]> {
    return of([
      { id: 'nia-supremo', nombre: 'Juez Supremo Titular' },
      { id: 'nia-superior', nombre: 'Superior Titular' },
      { id: 'nia-especializado', nombre: 'Especializado' },
      { id: 'nia-paz', nombre: 'Paz Letrado' },
    ]).pipe(delay(LATENCIA_MS));
  }

  listarColegiosAbogados(): Observable<CatalogoItem[]> {
    return of([
      { id: 'col-lima', nombre: 'LIMA' },
      { id: 'col-arequipa', nombre: 'AREQUIPA' },
      { id: 'col-cusco', nombre: 'CUSCO' },
      { id: 'col-la-libertad', nombre: 'LA LIBERTAD' },
      { id: 'col-piura', nombre: 'PIURA' },
      { id: 'col-callao', nombre: 'CALLAO' },
    ]).pipe(delay(LATENCIA_MS));
  }

  private nivelesTitular(): NivelTitular[] {
    return [
      {
        id: '1',
        nombre: 'Juez Superior Titular',
        abreviatura: 'SUP',
      },
      {
        id: '2',
        nombre: 'Juez Supremo Titular',
        abreviatura: 'SM',
      },
    ];
  }
}
