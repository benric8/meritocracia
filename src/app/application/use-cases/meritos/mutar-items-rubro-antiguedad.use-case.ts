import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { FichaValoracion } from '../../../domain/models/ficha-valoracion.model';
import { Colegiatura, Provisionalidad } from '../../../domain/models/rubro-antiguedad.model';
import { FICHA_PORT } from '../../../domain/ports/ficha.port';

export type MutarItemsRubroAntiguedadResultado =
  | { exito: true; ficha: FichaValoracion }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class MutarItemsRubroAntiguedadUseCase {
  private readonly fichas = inject(FICHA_PORT);

  upsertProvisionalidad(
    fichaId: string,
    item: Provisionalidad
  ): Observable<MutarItemsRubroAntiguedadResultado> {
    return this.ejecutarMutacion(fichaId, () =>
      this.fichas.upsertProvisionalidad(fichaId, item)
    );
  }

  eliminarProvisionalidad(
    fichaId: string,
    itemId: string
  ): Observable<MutarItemsRubroAntiguedadResultado> {
    return this.ejecutarMutacion(fichaId, () =>
      this.fichas.eliminarProvisionalidad(fichaId, itemId)
    );
  }

  upsertColegiatura(
    fichaId: string,
    item: Colegiatura
  ): Observable<MutarItemsRubroAntiguedadResultado> {
    return this.ejecutarMutacion(fichaId, () => this.fichas.upsertColegiatura(fichaId, item));
  }

  eliminarColegiatura(
    fichaId: string,
    itemId: string
  ): Observable<MutarItemsRubroAntiguedadResultado> {
    return this.ejecutarMutacion(fichaId, () =>
      this.fichas.eliminarColegiatura(fichaId, itemId)
    );
  }

  private ejecutarMutacion(
    fichaId: string,
    operacion: () => Observable<FichaValoracion>
  ): Observable<MutarItemsRubroAntiguedadResultado> {
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
