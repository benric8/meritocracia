import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { FichaValoracion } from '../../../domain/models/ficha-valoracion.model';
import { EstudioOfimatica } from '../../../domain/models/rubro-ofimatica.model';
import { FICHA_PORT } from '../../../domain/ports/ficha.port';

export type MutarItemsRubroOfimaticaResultado =
  | { exito: true; ficha: FichaValoracion }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class MutarItemsRubroOfimaticaUseCase {
  private readonly fichas = inject(FICHA_PORT);

  upsertEstudio(fichaId: string, item: EstudioOfimatica): Observable<MutarItemsRubroOfimaticaResultado> {
    return this.ejecutarMutacion(fichaId, () => this.fichas.upsertOfimatica(fichaId, item));
  }

  eliminarEstudio(
    fichaId: string,
    itemId: string
  ): Observable<MutarItemsRubroOfimaticaResultado> {
    return this.ejecutarMutacion(fichaId, () => this.fichas.eliminarOfimatica(fichaId, itemId));
  }

  private ejecutarMutacion(
    fichaId: string,
    operacion: () => Observable<FichaValoracion>
  ): Observable<MutarItemsRubroOfimaticaResultado> {
    if (!fichaId?.trim()) {
      return of({ exito: false, mensaje: 'Identificador de ficha no válido.' });
    }

    return operacion().pipe(
      map((ficha) => ({ exito: true as const, ficha })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo actualizar el estudio de ofimática.'),
        })
      )
    );
  }
}
