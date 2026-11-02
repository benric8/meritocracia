import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { FichaValoracionMeritos } from '../../../domain/models/ficha-valoracion-meritos.model';
import { FICHA_VALORACION_MERITOS_PORT } from '../../../domain/ports/ficha-valoracion-meritos.port';

export type ObtenerFichaValoracionMeritosResultado =
  | { exito: true; ficha: FichaValoracionMeritos }
  | { exito: false; detalle: DetalleError };

/** Ficha de Valoración de Méritos (Anexo 04) con los puntajes ya calculados por el backend. */
@Injectable({ providedIn: 'root' })
export class ObtenerFichaValoracionMeritosUseCase {
  private readonly fichas = inject(FICHA_VALORACION_MERITOS_PORT);

  ejecutar(idFicha: string): Observable<ObtenerFichaValoracionMeritosResultado> {
    return this.fichas.obtener(idFicha).pipe(
      map((ficha) => ({ exito: true as const, ficha })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo consultar la ficha de valoración de méritos.'),
        })
      )
    );
  }
}
