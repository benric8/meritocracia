import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import {
  FechaValoracion,
  NuevaFechaValoracion,
} from '../../../domain/models/fecha-valoracion.model';
import { FECHA_VALORACION_PORT } from '../../../domain/ports/fecha-valoracion.port';

export type RegistrarFechaValoracionResultado =
  | { exito: true; fecha: FechaValoracion }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

const RESOLUCION_MAX = 120;

@Injectable({ providedIn: 'root' })
export class RegistrarFechaValoracionUseCase {
  private readonly fechas = inject(FECHA_VALORACION_PORT);

  ejecutar(
    peticion: NuevaFechaValoracion,
    usuario: string
  ): Observable<RegistrarFechaValoracionResultado> {
    const fechaValoracion = peticion.fechaValoracion?.trim() ?? '';
    const resolucion = peticion.resolucion?.trim() ?? '';

    if (!fechaValoracion) {
      return of({ exito: false, mensaje: 'Seleccione una fecha de valoración.' });
    }

    if (!resolucion) {
      return of({
        exito: false,
        mensaje: 'Ingrese la resolución que aprueba la fecha de valoración.',
      });
    }

    if (resolucion.length > RESOLUCION_MAX) {
      return of({
        exito: false,
        mensaje: `La resolución no debe superar ${RESOLUCION_MAX} caracteres.`,
      });
    }

    const usuarioRegistro = usuario.trim();
    if (!usuarioRegistro) {
      return of({ exito: false, mensaje: 'No se pudo identificar al usuario de sesión.' });
    }

    return this.fechas
      .registrar({ fechaValoracion, resolucion }, usuarioRegistro)
      .pipe(
        map((fecha) => ({ exito: true as const, fecha })),
        catchError((error) =>
          of({
            exito: false as const,
            detalle: aDetalleError(error, 'No se pudo registrar la fecha de valoración.'),
          })
        )
      );
  }
}
