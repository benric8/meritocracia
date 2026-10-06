import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { ANTIGUEDAD_PORT } from '../../../domain/ports/antiguedad.port';

export type CalcularAniosColegiaturaResultado =
  | { exito: true; anios: number }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

const FECHA_ISO_REGEX = /^\d{4}-\d{2}-\d{2}$/;

@Injectable({ providedIn: 'root' })
export class CalcularAniosColegiaturaUseCase {
  private readonly antiguedad = inject(ANTIGUEDAD_PORT);

  ejecutar(
    fechaColegiatura: string,
    fechaValoracion: string
  ): Observable<CalcularAniosColegiaturaResultado> {
    const colegiatura = fechaColegiatura?.trim().slice(0, 10) ?? '';
    const valoracion = fechaValoracion?.trim().slice(0, 10) ?? '';

    if (
      !colegiatura ||
      !FECHA_ISO_REGEX.test(colegiatura) ||
      !valoracion ||
      !FECHA_ISO_REGEX.test(valoracion)
    ) {
      return of({ exito: false, mensaje: 'Fechas incompletas para calcular años de colegiatura.' });
    }

    return this.antiguedad.calcularAniosColegiatura(colegiatura, valoracion).pipe(
      map((anios) => ({ exito: true as const, anios })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudieron calcular los años de colegiatura.'),
        })
      )
    );
  }
}
