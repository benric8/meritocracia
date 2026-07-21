import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { FichaValoracion } from '../../../domain/models/ficha-valoracion.model';
import { GradoTitulo } from '../../../domain/models/rubro-grados-titulos.model';
import { FICHA_PORT } from '../../../domain/ports/ficha.port';

export type MutarItemsRubroGradosTitulosResultado =
  | { exito: true; ficha: FichaValoracion }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class MutarItemsRubroGradosTitulosUseCase {
  private readonly fichas = inject(FICHA_PORT);

  upsertGradoTitulo(
    fichaId: string,
    item: GradoTitulo
  ): Observable<MutarItemsRubroGradosTitulosResultado> {
    return this.ejecutarMutacion(fichaId, () => this.fichas.upsertGradoTitulo(fichaId, item));
  }

  eliminarGradoTitulo(
    fichaId: string,
    itemId: string
  ): Observable<MutarItemsRubroGradosTitulosResultado> {
    return this.ejecutarMutacion(fichaId, () =>
      this.fichas.eliminarGradoTitulo(fichaId, itemId)
    );
  }

  private ejecutarMutacion(
    fichaId: string,
    operacion: () => Observable<FichaValoracion>
  ): Observable<MutarItemsRubroGradosTitulosResultado> {
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
