import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { FichaValoracion } from '../../../domain/models/ficha-valoracion.model';
import { PeriodoNivelAnterior } from '../../../domain/models/rubro-antiguedad.model';
import { FICHA_PORT } from '../../../domain/ports/ficha.port';

export type GuardarPeriodoNivelAnteriorFichaResultado =
  | { exito: true; ficha: FichaValoracion }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class GuardarPeriodoNivelAnteriorFichaUseCase {
  private readonly fichas = inject(FICHA_PORT);

  ejecutar(
    fichaId: string,
    data: PeriodoNivelAnterior
  ): Observable<GuardarPeriodoNivelAnteriorFichaResultado> {
    const id = fichaId?.trim() ?? '';
    if (!id) {
      return of({ exito: false, mensaje: 'Identificador de ficha no válido.' });
    }

    return this.fichas.guardarPeriodoNivelAnterior(id, data).pipe(
      map((ficha) => ({ exito: true as const, ficha })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo guardar el periodo de nivel anterior.'),
        })
      )
    );
  }
}
