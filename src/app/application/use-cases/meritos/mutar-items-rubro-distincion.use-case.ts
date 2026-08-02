import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { FichaValoracion } from '../../../domain/models/ficha-valoracion.model';
import { Distincion } from '../../../domain/models/rubro-distincion.model';
import { FICHA_PORT } from '../../../domain/ports/ficha.port';

export type MutarItemsRubroDistincionResultado =
  | { exito: true; ficha: FichaValoracion }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class MutarItemsRubroDistincionUseCase {
  private readonly fichas = inject(FICHA_PORT);

  upsertDistincion(
    fichaId: string,
    item: Distincion
  ): Observable<MutarItemsRubroDistincionResultado> {
    return this.ejecutarMutacion(fichaId, () => this.fichas.upsertDistincion(fichaId, item));
  }

  eliminarDistincion(
    fichaId: string,
    itemId: string
  ): Observable<MutarItemsRubroDistincionResultado> {
    return this.ejecutarMutacion(fichaId, () => this.fichas.eliminarDistincion(fichaId, itemId));
  }

  private ejecutarMutacion(
    fichaId: string,
    operacion: () => Observable<FichaValoracion>
  ): Observable<MutarItemsRubroDistincionResultado> {
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
