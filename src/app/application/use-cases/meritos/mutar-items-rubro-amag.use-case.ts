import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { FichaValoracion } from '../../../domain/models/ficha-valoracion.model';
import { EstudioAmag } from '../../../domain/models/rubro-amag.model';
import { FICHA_PORT } from '../../../domain/ports/ficha.port';

export type MutarItemsRubroAmagResultado =
  | { exito: true; ficha: FichaValoracion }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class MutarItemsRubroAmagUseCase {
  private readonly fichas = inject(FICHA_PORT);

  upsertEstudioAmag(
    fichaId: string,
    item: EstudioAmag
  ): Observable<MutarItemsRubroAmagResultado> {
    return this.ejecutarMutacion(fichaId, () => this.fichas.upsertEstudioAmag(fichaId, item));
  }

  eliminarEstudioAmag(
    fichaId: string,
    itemId: string
  ): Observable<MutarItemsRubroAmagResultado> {
    return this.ejecutarMutacion(fichaId, () =>
      this.fichas.eliminarEstudioAmag(fichaId, itemId)
    );
  }

  private ejecutarMutacion(
    fichaId: string,
    operacion: () => Observable<FichaValoracion>
  ): Observable<MutarItemsRubroAmagResultado> {
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
