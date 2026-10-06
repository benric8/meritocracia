import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { ResultadoResolverFicha } from '../../../domain/models/ficha-valoracion.model';
import { FICHA_PORT } from '../../../domain/ports/ficha.port';

export type ResolverFichaDelCicloResultado =
  | { exito: true; resultado: ResultadoResolverFicha }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class ResolverFichaDelCicloUseCase {
  private readonly fichas = inject(FICHA_PORT);

  ejecutar(dni: string, fechaValoracionId: string): Observable<ResolverFichaDelCicloResultado> {
    const dniNorm = dni?.trim() ?? '';
    const fechaId = fechaValoracionId?.trim() ?? '';

    if (!/^\d{8}$/.test(dniNorm)) {
      return of({ exito: false, mensaje: 'Ingrese un DNI válido de 8 dígitos.' });
    }

    if (!fechaId) {
      return of({
        exito: false,
        mensaje: 'No hay fecha de valoración vigente para resolver la ficha.',
      });
    }

    return this.fichas.resolverDelCiclo(dniNorm, fechaId).pipe(
      map((resultado) => ({ exito: true as const, resultado })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo resolver la ficha del ciclo.'),
        })
      )
    );
  }
}
