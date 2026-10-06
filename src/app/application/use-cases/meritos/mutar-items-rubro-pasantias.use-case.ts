import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { FichaValoracion } from '../../../domain/models/ficha-valoracion.model';
import { Pasantia } from '../../../domain/models/rubro-pasantias.model';
import { FICHA_PORT } from '../../../domain/ports/ficha.port';

export type MutarItemsRubroPasantiasResultado =
  | { exito: true; ficha: FichaValoracion }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class MutarItemsRubroPasantiasUseCase {
  private readonly fichas = inject(FICHA_PORT);

  upsertPasantia(
    fichaId: string,
    item: Pasantia
  ): Observable<MutarItemsRubroPasantiasResultado> {
    return this.ejecutarMutacion(fichaId, () => this.fichas.upsertPasantia(fichaId, item));
  }

  eliminarPasantia(
    fichaId: string,
    itemId: string
  ): Observable<MutarItemsRubroPasantiasResultado> {
    return this.ejecutarMutacion(fichaId, () => this.fichas.eliminarPasantia(fichaId, itemId));
  }

  private ejecutarMutacion(
    fichaId: string,
    operacion: () => Observable<FichaValoracion>
  ): Observable<MutarItemsRubroPasantiasResultado> {
    if (!fichaId?.trim()) {
      return of({ exito: false, mensaje: 'Identificador de ficha no válido.' });
    }

    return operacion().pipe(
      map((ficha) => ({ exito: true as const, ficha })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo actualizar la pasantía.'),
        })
      )
    );
  }
}
