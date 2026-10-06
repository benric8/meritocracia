import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import {
  ActualizarDatosPersonalesFicha,
  FichaValoracion,
} from '../../../domain/models/ficha-valoracion.model';
import { FICHA_PORT } from '../../../domain/ports/ficha.port';

export type ActualizarDatosPersonalesFichaResultado =
  | { exito: true; ficha: FichaValoracion }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class ActualizarDatosPersonalesFichaUseCase {
  private readonly fichas = inject(FICHA_PORT);

  ejecutar(
    fichaId: string,
    peticion: ActualizarDatosPersonalesFicha
  ): Observable<ActualizarDatosPersonalesFichaResultado> {
    const id = fichaId?.trim() ?? '';
    if (!id) {
      return of({ exito: false, mensaje: 'Identificador de ficha no válido.' });
    }

    const dni = peticion.datosPersonales?.dni?.trim() ?? '';
    if (!/^\d{8}$/.test(dni)) {
      return of({ exito: false, mensaje: 'Ingrese el DNI del juez (8 dígitos).' });
    }

    return this.fichas.actualizarDatosPersonales(id, peticion).pipe(
      map((ficha) => ({ exito: true as const, ficha })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudieron actualizar los datos personales.'),
        })
      )
    );
  }
}
