import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { SubrubroMaestro } from '../../../domain/models/subrubro-maestro.model';
import { MAESTROS_PORT } from '../../../domain/ports/maestros.port';

export type ListarSubrubrosMaestroResultado =
  | { exito: true; subrubros: SubrubroMaestro[] }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class ListarSubrubrosMaestroUseCase {
  private readonly maestros = inject(MAESTROS_PORT);

  ejecutar(idRubro: number): Observable<ListarSubrubrosMaestroResultado> {
    return this.maestros.listarSubrubros(idRubro).pipe(
      map((subrubros) => ({ exito: true as const, subrubros })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo cargar el catálogo de subrubros.'),
        })
      )
    );
  }
}
