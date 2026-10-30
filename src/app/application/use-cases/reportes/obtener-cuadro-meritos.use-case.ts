import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { CuadroMeritos, FiltrosCuadroMeritos } from '../../../domain/models/cuadro-meritos.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { CUADRO_MERITOS_PORT } from '../../../domain/ports/cuadro-meritos.port';

export type ObtenerCuadroMeritosResultado =
  | { exito: true; cuadro: CuadroMeritos }
  | { exito: false; detalle: DetalleError };

/** Cuadro de Méritos de Jueces Superiores Titulares (ordenado y filtrado por el backend). */
@Injectable({ providedIn: 'root' })
export class ObtenerCuadroMeritosUseCase {
  private readonly cuadros = inject(CUADRO_MERITOS_PORT);

  ejecutar(filtros: FiltrosCuadroMeritos): Observable<ObtenerCuadroMeritosResultado> {
    return this.cuadros.obtener(filtros).pipe(
      map((cuadro) => ({ exito: true as const, cuadro })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo consultar el cuadro de méritos.'),
        })
      )
    );
  }
}
