import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { FichaValoracion } from '../../../domain/models/ficha-valoracion.model';
import { EstudioIdioma } from '../../../domain/models/rubro-idioma.model';
import { FICHA_PORT } from '../../../domain/ports/ficha.port';

export type MutarItemsRubroIdiomaResultado =
  | { exito: true; ficha: FichaValoracion }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class MutarItemsRubroIdiomaUseCase {
  private readonly fichas = inject(FICHA_PORT);

  upsertEstudioIdioma(
    fichaId: string,
    item: EstudioIdioma
  ): Observable<MutarItemsRubroIdiomaResultado> {
    return this.ejecutarMutacion(fichaId, () => this.fichas.upsertEstudioIdioma(fichaId, item));
  }

  eliminarEstudioIdioma(
    fichaId: string,
    itemId: string
  ): Observable<MutarItemsRubroIdiomaResultado> {
    return this.ejecutarMutacion(fichaId, () =>
      this.fichas.eliminarEstudioIdioma(fichaId, itemId)
    );
  }

  private ejecutarMutacion(
    fichaId: string,
    operacion: () => Observable<FichaValoracion>
  ): Observable<MutarItemsRubroIdiomaResultado> {
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
