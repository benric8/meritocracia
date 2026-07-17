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
      { id: 'ct-supremo', nombre: 'Juez Supremo Titular', nivelId: '2' },
      { id: 'ct-superior', nombre: 'Juez Superior Titular', nivelId: '1' },
      { id: 'ct-especializado', nombre: 'Juez Especializado Titular', nivelId: '3' },
      { id: 'ct-paz', nombre: 'Juez de Paz Letrado Titular', nivelId: '4' },
    ]).pipe(delay(LATENCIA_MS));
  }

  listarCargosProvisional(): Observable<CatalogoItem[]> {
    // `nivelId` = nivel actual de la ficha (provisionalidad en el nivel titular actual).
    return of([
      { id: 'cp-supremo', nombre: 'Juez Supremo', nivelId: '2' },
      { id: 'cp-superior', nombre: 'Juez Superior', nivelId: '1' },
      { id: 'cp-especializado', nombre: 'Juez Especializado', nivelId: '3' },
      { id: 'cp-paz', nombre: 'Juez de Paz Letrado', nivelId: '4' },
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
    // `nivelId` = nivel actual de la ficha al que corresponde este inmediato anterior.
    return of([
      {
        id: 'nia-superior',
        nombre: 'Juez Superior Titular',
        nivelId: '2', // de Juez Supremo Titular
      },
      {
        id: 'nia-especializado',
        nombre: 'Juez Especializado Titular',
        nivelId: '1', // de Juez Superior Titular
      },
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
