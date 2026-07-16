import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { TiempoServicio } from '../../../domain/models/tiempo-servicio.model';
import { ANTIGUEDAD_PORT } from '../../../domain/ports/antiguedad.port';

export type CalcularPuntajeAntiguedadResultado =
  | { exito: true; puntaje: number }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class CalcularPuntajeAntiguedadUseCase {
  private readonly antiguedad = inject(ANTIGUEDAD_PORT);

  ejecutar(tiempo: TiempoServicio): Observable<CalcularPuntajeAntiguedadResultado> {
    return this.antiguedad.calcularPuntajePorAnios(tiempo).pipe(
      map((puntaje) => ({ exito: true as const, puntaje })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo calcular el puntaje de antigüedad.'),
        })
      )
    );
  }
}
