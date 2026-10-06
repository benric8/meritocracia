import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { RubroMaestro } from '../../../domain/models/rubro-maestro.model';
import { MAESTROS_PORT } from '../../../domain/ports/maestros.port';

export type ListarRubrosMaestroResultado =
  | { exito: true; rubros: RubroMaestro[] }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class ListarRubrosMaestroUseCase {
  private readonly maestros = inject(MAESTROS_PORT);

  ejecutar(): Observable<ListarRubrosMaestroResultado> {
    return this.maestros.listarRubros().pipe(
      map((rubros) => ({ exito: true as const, rubros })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo cargar el catálogo de rubros.'),
        })
      )
    );
  }
}
