import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import {
  CalculoTiempoTitularParams,
  TIEMPO_SERVICIO_CERO,
  TiempoServicio,
} from '../../../domain/models/tiempo-servicio.model';
import { ANTIGUEDAD_PORT } from '../../../domain/ports/antiguedad.port';

export type CalcularTiempoServicioResultado =
  | { exito: true; tiempo: TiempoServicio }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

const FECHA_ISO_REGEX = /^\d{4}-\d{2}-\d{2}$/;

@Injectable({ providedIn: 'root' })
export class CalcularTiempoServicioUseCase {
  private readonly antiguedad = inject(ANTIGUEDAD_PORT);

  ejecutarEntreFechas(
    inicio: string,
    fin: string
  ): Observable<CalcularTiempoServicioResultado> {
    const desde = inicio?.trim().slice(0, 10) ?? '';
    const hasta = fin?.trim().slice(0, 10) ?? '';

    if (!desde || !FECHA_ISO_REGEX.test(desde) || !hasta || !FECHA_ISO_REGEX.test(hasta)) {
      return of({ exito: true, tiempo: TIEMPO_SERVICIO_CERO });
    }

    return this.antiguedad.calcularTiempo(desde, hasta).pipe(
      map((tiempo) => ({ exito: true as const, tiempo })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo calcular el tiempo de servicio.'),
        })
      )
    );
  }

  ejecutarTiempoTitular(
    params: CalculoTiempoTitularParams
  ): Observable<CalcularTiempoServicioResultado> {
    const juramentacion = params.fechaJuramentacion?.trim().slice(0, 10) ?? '';
    const valoracion = params.fechaValoracion?.trim().slice(0, 10) ?? '';

    if (
      !juramentacion ||
      !FECHA_ISO_REGEX.test(juramentacion) ||
      !valoracion ||
      !FECHA_ISO_REGEX.test(valoracion)
    ) {
      return of({ exito: true, tiempo: TIEMPO_SERVICIO_CERO });
    }

    return this.antiguedad
      .calcularTiempoTitular({
        ...params,
        fechaJuramentacion: juramentacion,
        fechaValoracion: valoracion,
        fechaCese: params.fechaCese?.trim().slice(0, 10) || null,
        fechaReincorporacion: params.fechaReincorporacion?.trim().slice(0, 10) || null,
      })
      .pipe(
        map((tiempo) => ({ exito: true as const, tiempo })),
        catchError((error) =>
          of({
            exito: false as const,
            detalle: aDetalleError(
              error,
              'No se pudo calcular el tiempo en cargo titular.'
            ),
          })
        )
      );
  }

  sumar(tiempos: TiempoServicio[]): Observable<CalcularTiempoServicioResultado> {
    if (!tiempos.length) {
      return of({ exito: true, tiempo: TIEMPO_SERVICIO_CERO });
    }

    return this.antiguedad.sumarTiempos(tiempos).pipe(
      map((tiempo) => ({ exito: true as const, tiempo })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo sumar los tiempos de servicio.'),
        })
      )
    );
  }
}
