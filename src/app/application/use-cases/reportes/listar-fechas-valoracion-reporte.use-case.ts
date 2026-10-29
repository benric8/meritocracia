import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { FechaValoracion } from '../../../domain/models/fecha-valoracion.model';
import { FECHA_VALORACION_PORT } from '../../../domain/ports/fecha-valoracion.port';

export type ListarFechasValoracionReporteResultado =
  | { exito: true; fechas: FechaValoracion[]; idVigente: string | null }
  | { exito: false; detalle: DetalleError };

/** Selector de fecha de valoración de los reportes: historial + la vigente preseleccionada. */
@Injectable({ providedIn: 'root' })
export class ListarFechasValoracionReporteUseCase {
  private readonly fechas = inject(FECHA_VALORACION_PORT);

  ejecutar(): Observable<ListarFechasValoracionReporteResultado> {
    return forkJoin({
      historial: this.fechas.listarHistorial(),
      vigente: this.fechas.obtenerVigente(),
    }).pipe(
      map(({ historial, vigente }) => {
        const fechas = [...historial].sort((a, b) =>
          b.fechaValoracion.localeCompare(a.fechaValoracion)
        );
        // La vigente podría no venir en el historial: se agrega para poder preseleccionarla.
        if (vigente && !fechas.some((fecha) => fecha.id === vigente.id)) {
          fechas.unshift(vigente);
        }
        return { exito: true as const, fechas, idVigente: vigente?.id ?? null };
      }),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudieron cargar las fechas de valoración.'),
        })
      )
    );
  }
}
