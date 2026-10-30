import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import {
  CuadroAntiguedadSuperiores,
  FiltrosCuadroAntiguedadSuperiores,
} from '../../../domain/models/cuadro-antiguedad-superiores.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { CUADRO_ANTIGUEDAD_SUPERIORES_PORT } from '../../../domain/ports/cuadro-antiguedad-superiores.port';

export type ObtenerCuadroAntiguedadSuperioresResultado =
  | { exito: true; cuadro: CuadroAntiguedadSuperiores }
  | { exito: false; detalle: DetalleError };

/** Cuadro de Antigüedad de Jueces Superiores Titulares, nacional o de una Corte. */
@Injectable({ providedIn: 'root' })
export class ObtenerCuadroAntiguedadSuperioresUseCase {
  private readonly cuadros = inject(CUADRO_ANTIGUEDAD_SUPERIORES_PORT);

  ejecutar(
    filtros: FiltrosCuadroAntiguedadSuperiores
  ): Observable<ObtenerCuadroAntiguedadSuperioresResultado> {
    return this.cuadros.obtener(filtros).pipe(
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
