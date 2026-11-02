import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { ArchivoDescargado } from '../../../domain/models/reporte-descarga.model';
import { FICHA_VALORACION_MERITOS_PORT } from '../../../domain/ports/ficha-valoracion-meritos.port';

export type DescargarFichaValoracionMeritosResultado =
  | { exito: true; archivo: ArchivoDescargado }
  | { exito: false; detalle: DetalleError };

/** PDF del Anexo 04 de la ficha en pantalla. */
@Injectable({ providedIn: 'root' })
export class DescargarFichaValoracionMeritosUseCase {
  private readonly fichas = inject(FICHA_VALORACION_MERITOS_PORT);

  ejecutar(idFicha: string): Observable<DescargarFichaValoracionMeritosResultado> {
    return this.fichas.descargarPdf(idFicha).pipe(
      map((archivo) => ({ exito: true as const, archivo })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo descargar la ficha de valoración de méritos.'),
        })
      )
    );
  }
}
