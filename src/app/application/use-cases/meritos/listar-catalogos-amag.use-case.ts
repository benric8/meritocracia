import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { aDetalleError } from '../../errors/detalle-error.mapper';
import { CatalogoItem } from '../../../domain/models/catalogo-item.model';
import { DetalleError } from '../../../domain/models/detalle-error.model';
import { MAESTROS_PORT } from '../../../domain/ports/maestros.port';

export interface CatalogosAmag {
  tiposCurso: CatalogoItem[];
}

export type ListarCatalogosAmagResultado =
  | { exito: true; catalogos: CatalogosAmag }
  | { exito: false; mensaje?: string; detalle?: DetalleError };

@Injectable({ providedIn: 'root' })
export class ListarCatalogosAmagUseCase {
  private readonly maestros = inject(MAESTROS_PORT);

  ejecutar(): Observable<ListarCatalogosAmagResultado> {
    return this.maestros.listarTiposCursoAmag().pipe(
      map((tiposCurso) => ({ exito: true as const, catalogos: { tiposCurso } })),
      catchError((error) =>
        of({
          exito: false as const,
          detalle: aDetalleError(error, 'No se pudieron cargar los catálogos de estudios AMAG.'),
        })
      )
    );
  }
}
