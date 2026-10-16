import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { SUPLENCIAS_PORT } from '../../../domain/ports/suplencias.port';

export type RetirarSuplenciaResultado =
  | { exito: true }
  | { exito: false; detalle: DetalleError };

@Injectable({ providedIn: 'root' })
export class RetirarSuplenciaUseCase {
  private readonly suplencias = inject(SUPLENCIAS_PORT);

  ejecutar(fichaId: string): Observable<RetirarSuplenciaResultado> {
    return this.suplencias.retirar(fichaId).pipe(
      map(() => ({ exito: true as const })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo retirar la suplencia.'),
        })
      )
    );
  }
}
