import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { PuntajesFicha } from '../../../domain/models/ficha-valoracion.model';
import { FICHA_PORT } from '../../../domain/ports/ficha.port';

export type ObtenerPuntajesFichaResultado =
  | { exito: true; puntajes: PuntajesFicha }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class ObtenerPuntajesFichaUseCase {
  private readonly fichas = inject(FICHA_PORT);

  ejecutar(fichaId: string): Observable<ObtenerPuntajesFichaResultado> {
    const id = fichaId?.trim() ?? '';
    if (!id) {
      return of({ exito: false, mensaje: 'Identificador de ficha no válido.' });
    }

    return this.fichas.obtenerPuntajes(id).pipe(
      map((puntajes) => ({ exito: true as const, puntajes })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudieron obtener los puntajes de la ficha.'),
        })
      )
    );
  }
}
