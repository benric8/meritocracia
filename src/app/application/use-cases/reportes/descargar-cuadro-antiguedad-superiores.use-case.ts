import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { FiltrosCuadroAntiguedadSuperiores } from '../../../domain/models/cuadro-antiguedad-superiores.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import {
  ArchivoDescargado,
  FormatoDescargaCuadro,
} from '../../../domain/models/reporte-descarga.model';
import { CUADRO_ANTIGUEDAD_SUPERIORES_PORT } from '../../../domain/ports/cuadro-antiguedad-superiores.port';

export type DescargarCuadroAntiguedadSuperioresResultado =
  | { exito: true; archivo: ArchivoDescargado }
  | { exito: false; detalle: DetalleError };

/** Excel / PDF del Anexo 03 con los mismos filtros del cuadro en pantalla. */
@Injectable({ providedIn: 'root' })
export class DescargarCuadroAntiguedadSuperioresUseCase {
  private readonly cuadros = inject(CUADRO_ANTIGUEDAD_SUPERIORES_PORT);

  ejecutar(
    formato: FormatoDescargaCuadro,
    filtros: FiltrosCuadroAntiguedadSuperiores
  ): Observable<DescargarCuadroAntiguedadSuperioresResultado> {
    return this.cuadros.descargar(formato, filtros).pipe(
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
