import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DatosSigaJuez } from '../../../domain/models/datos-siga-juez.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { JUEZ_PORT } from '../../../domain/ports/juez.port';

export type ObtenerDatosSigaJuezResultado =
  | { exito: true; datos: DatosSigaJuez }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

const DNI_REGEX = /^\d{8}$/;

@Injectable({ providedIn: 'root' })
export class ObtenerDatosSigaJuezUseCase {
  private readonly juez = inject(JUEZ_PORT);

  ejecutar(dni: string): Observable<ObtenerDatosSigaJuezResultado> {
    const documento = dni?.trim() ?? '';

    if (!documento) {
      return of({ exito: false, mensaje: 'Ingrese el DNI del juez.' });
    }

    if (!DNI_REGEX.test(documento)) {
      return of({ exito: false, mensaje: 'El DNI debe tener 8 dígitos.' });
    }

    return this.juez.obtenerDatosSiga(documento).pipe(
      map((datos) => ({ exito: true as const, datos })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo obtener los datos del juez en SIGA.'),
        })
      )
    );
  }
}
