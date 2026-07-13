import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { FECHA_VALORACION_PORT } from '../../../domain/ports/fecha-valoracion.port';

export type DesactivarFechaValoracionResultado =
  | { exito: true }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class DesactivarFechaValoracionUseCase {
  private readonly fechas = inject(FECHA_VALORACION_PORT);

  ejecutar(id: string): Observable<DesactivarFechaValoracionResultado> {
    const idNormalizado = id?.trim() ?? '';

    if (!idNormalizado) {
      return of({ exito: false, mensaje: 'No se identificó la fecha de valoración a desactivar.' });
    }

    return this.fechas.desactivar(idNormalizado).pipe(
      map(() => ({ exito: true as const })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo desactivar la fecha de valoración.'),
        })
      )
    );
  }
}
