import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { CatalogoItem } from '../../../domain/models/catalogo-item.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { MAESTROS_PORT } from '../../../domain/ports/maestros.port';

export type BuscarUniversidadesResultado =
  | { exito: true; universidades: CatalogoItem[] }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class BuscarUniversidadesUseCase {
  private readonly maestros = inject(MAESTROS_PORT);

  ejecutar(
    termino: string,
    paisId?: string,
    limite = 20
  ): Observable<BuscarUniversidadesResultado> {
    return this.maestros.buscarUniversidades(termino, paisId, limite).pipe(
      map((universidades) => ({ exito: true as const, universidades })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudieron buscar universidades.'),
        })
      )
    );
  }
}
