import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { FiltrosCuadroMeritos } from '../../../domain/models/cuadro-meritos.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import {
  ArchivoDescargado,
  FormatoDescargaCuadro,
} from '../../../domain/models/reporte-descarga.model';
import { CUADRO_MERITOS_PORT } from '../../../domain/ports/cuadro-meritos.port';

export type DescargarCuadroMeritosResultado =
  | { exito: true; archivo: ArchivoDescargado }
  | { exito: false; detalle: DetalleError };

/** Excel / PDF del Anexo 02 con los filtros de la última búsqueda. */
@Injectable({ providedIn: 'root' })
export class DescargarCuadroMeritosUseCase {
  private readonly cuadros = inject(CUADRO_MERITOS_PORT);

  ejecutar(
    formato: FormatoDescargaCuadro,
    filtros: FiltrosCuadroMeritos
  ): Observable<DescargarCuadroMeritosResultado> {
    return this.cuadros.descargar(formato, filtros).pipe(
      map((archivo) => ({ exito: true as const, archivo })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo descargar el cuadro de méritos.'),
        })
      )
    );
  }
}
