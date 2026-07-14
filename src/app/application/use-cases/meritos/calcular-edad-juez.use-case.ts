import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { EdadJuez } from '../../../domain/models/datos-siga-juez.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { JUEZ_PORT } from '../../../domain/ports/juez.port';

export type CalcularEdadJuezResultado =
  | { exito: true; edad: EdadJuez }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

const FECHA_ISO_REGEX = /^\d{4}-\d{2}-\d{2}$/;

@Injectable({ providedIn: 'root' })
export class CalcularEdadJuezUseCase {
  private readonly juez = inject(JUEZ_PORT);

  ejecutar(
    fechaNacimiento: string,
    fechaValoracion: string
  ): Observable<CalcularEdadJuezResultado> {
    const nacimiento = fechaNacimiento?.trim() ?? '';
    const valoracion = fechaValoracion?.trim() ?? '';

    if (!nacimiento || !FECHA_ISO_REGEX.test(nacimiento)) {
      return of({ exito: false, mensaje: 'Seleccione la fecha de nacimiento.' });
    }

    if (!valoracion || !FECHA_ISO_REGEX.test(valoracion.slice(0, 10))) {
      return of({
        exito: false,
        mensaje: 'No hay una fecha de valoración vigente para calcular la edad.',
      });
    }

    return this.juez
      .calcularEdad({
        fechaNacimiento: nacimiento,
        fechaValoracion: valoracion.slice(0, 10),
      })
      .pipe(
        map((edad) => ({ exito: true as const, edad })),
        catchError((error) =>
          of({
            exito: false as const,
            detalle: aDetalleError(error, 'No se pudo calcular la edad del juez.'),
          })
        )
      );
  }
}
