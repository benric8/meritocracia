import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { CuadroAntiguedad } from '../../../domain/models/cuadro-antiguedad.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { CUADRO_ANTIGUEDAD_PORT } from '../../../domain/ports/cuadro-antiguedad.port';

export type ObtenerCuadroAntiguedadResultado =
  | { exito: true; cuadro: CuadroAntiguedad }
  | { exito: false; detalle: DetalleError };

/** Cuadro de Antigüedad de Jueces Supremos Titulares (ordenado por el backend). */
@Injectable({ providedIn: 'root' })
export class ObtenerCuadroAntiguedadUseCase {
  private readonly cuadros = inject(CUADRO_ANTIGUEDAD_PORT);

  ejecutar(idFechaValoracion?: string): Observable<ObtenerCuadroAntiguedadResultado> {
    return this.cuadros.obtener(idFechaValoracion).pipe(
      map((cuadro) => ({ exito: true as const, cuadro })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo consultar el cuadro de antigüedad.'),
        })
      )
    );
  }
}
