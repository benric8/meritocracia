import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { NivelTitular } from '../../../domain/models/nivel-titular.model';
import { MaestrosPort } from '../../../domain/ports/maestros.port';

const LATENCIA_MS = 300;

@Injectable({ providedIn: 'root' })
export class MaestrosMockAdapter implements MaestrosPort {
  listarNivelesTitular(): Observable<NivelTitular[]> {
    return of(this.nivelesTitular()).pipe(delay(LATENCIA_MS));
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
