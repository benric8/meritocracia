import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { FichaValoracion } from '../../../domain/models/ficha-valoracion.model';
import { Demerito } from '../../../domain/models/rubro-demerito.model';
import { FICHA_PORT } from '../../../domain/ports/ficha.port';

export type MutarItemsRubroDemeritoResultado =
  | { exito: true; ficha: FichaValoracion }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class MutarItemsRubroDemeritoUseCase {
  private readonly fichas = inject(FICHA_PORT);

  upsertDemerito(
    fichaId: string,
    item: Demerito
  ): Observable<MutarItemsRubroDemeritoResultado> {
    return this.ejecutarMutacion(fichaId, () => this.fichas.upsertDemerito(fichaId, item));
  }

  eliminarDemerito(
    fichaId: string,
    itemId: string
  ): Observable<MutarItemsRubroDemeritoResultado> {
    return this.ejecutarMutacion(fichaId, () => this.fichas.eliminarDemerito(fichaId, itemId));
  }

  private ejecutarMutacion(
    fichaId: string,
    operacion: () => Observable<FichaValoracion>
  ): Observable<MutarItemsRubroDemeritoResultado> {
    if (!fichaId?.trim()) {
      return of({ exito: false, mensaje: 'Identificador de ficha no válido.' });
    }

    return operacion().pipe(
      map((ficha) => ({ exito: true as const, ficha })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo actualizar el ítem del rubro.'),
        })
      )
    );
  }
}
