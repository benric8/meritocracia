import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import {
  ArchivoDescargado,
  FormatoDescargaCuadro,
} from '../../../domain/models/cuadro-antiguedad.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { CUADRO_ANTIGUEDAD_PORT } from '../../../domain/ports/cuadro-antiguedad.port';

export type DescargarCuadroAntiguedadResultado =
  | { exito: true; archivo: ArchivoDescargado }
  | { exito: false; detalle: DetalleError };

/** Excel / PDF del Anexo 01 para la misma fecha de valoración que se ve en pantalla. */
@Injectable({ providedIn: 'root' })
export class DescargarCuadroAntiguedadUseCase {
  private readonly cuadros = inject(CUADRO_ANTIGUEDAD_PORT);

  ejecutar(
    formato: FormatoDescargaCuadro,
    idFechaValoracion?: string
  ): Observable<DescargarCuadroAntiguedadResultado> {
    return this.cuadros.descargar(formato, idFechaValoracion).pipe(
      map((archivo) => ({ exito: true as const, archivo })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo descargar el cuadro de antigüedad.'),
        })
      )
    );
  }
}
