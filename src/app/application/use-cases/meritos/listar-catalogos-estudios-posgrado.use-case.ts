import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { CatalogoItem } from '../../../domain/models/catalogo-item.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { MAESTROS_PORT } from '../../../domain/ports/maestros.port';

export type ListarCatalogosEstudiosPosgradoResultado =
  | { exito: true; paises: CatalogoItem[] }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class ListarCatalogosEstudiosPosgradoUseCase {
  private readonly maestros = inject(MAESTROS_PORT);

  ejecutar(): Observable<ListarCatalogosEstudiosPosgradoResultado> {
    return this.maestros.listarPaises().pipe(
      map((paises) => ({ exito: true as const, paises })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudo cargar el catálogo de países.'),
        })
      )
    );
  }
}
