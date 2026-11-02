import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { ArchivoDescargado } from '../../../domain/models/reporte-descarga.model';
import { CARPETA_PERSONAL_MERITOS_PORT } from '../../../domain/ports/carpeta-personal-meritos.port';

export type DescargarCarpetaPersonalMeritosResultado =
  | { exito: true; archivo: ArchivoDescargado }
  | { exito: false; detalle: DetalleError };

/** PDF del Anexo 05 de la carpeta en pantalla. */
@Injectable({ providedIn: 'root' })
export class DescargarCarpetaPersonalMeritosUseCase {
  private readonly carpetas = inject(CARPETA_PERSONAL_MERITOS_PORT);

  ejecutar(idFicha: string): Observable<DescargarCarpetaPersonalMeritosResultado> {
    return this.carpetas.descargarPdf(idFicha).pipe(
      map((archivo) => ({ exito: true as const, archivo })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo descargar la carpeta personal de méritos.'),
        })
      )
    );
  }
}
