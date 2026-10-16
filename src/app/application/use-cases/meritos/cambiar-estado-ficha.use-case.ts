import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { FICHAS_CONSULTA_PORT } from '../../../domain/ports/fichas-consulta.port';

export type CambiarEstadoFichaResultado =
  | { exito: true }
  | { exito: false; detalle: DetalleError };

@Injectable({ providedIn: 'root' })
export class CambiarEstadoFichaUseCase {
  private readonly fichas = inject(FICHAS_CONSULTA_PORT);

  ejecutar(fichaId: string, activa: boolean): Observable<CambiarEstadoFichaResultado> {
    return this.fichas.cambiarEstado(fichaId, activa).pipe(
      map(() => ({ exito: true as const })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo cambiar el estado de la ficha.'),
        })
      )
    );
  }
}
